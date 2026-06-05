import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { AppConfig } from '../config/AppConfig';
import { AttendanceRepository } from '../database/AttendanceRepository';

const LAST_SYNC_KEY = '@last_sync_time';
const RETRY_DELAY_MS = 2 * 60 * 1000; // 2 minutes

let isSyncing = false; // prevent overlapping sync loops

export class SyncService {

    static async getLastSyncTime(): Promise<string | null> {
        return AsyncStorage.getItem(LAST_SYNC_KEY);
    }

    // Call this from App.tsx and AttendanceService.
    // Tries to sync, and if records still fail but internet is up, retries every 2 mins.
    static async syncWithRetry(): Promise<void> {
        if (isSyncing) return; // already running, don't start another loop
        isSyncing = true;

        try {
            while (true) {
                await SyncService._uploadPending();

                const remaining = AttendanceRepository.getPending();
                if (remaining.length === 0) break; // all done

                // Still have pending — check if internet is up
                const net = await NetInfo.fetch();
                if (!net.isConnected || !net.isInternetReachable) {
                    console.log('[SYNC] No internet, stopping retry loop — will resume on reconnect');
                    break;
                }

                // Internet is up but server/lambda failed — wait 2 mins and retry
                console.log(`[SYNC] ${remaining.length} record(s) still pending, retrying in 2 minutes...`);
                await new Promise<void>(resolve => setTimeout(resolve, RETRY_DELAY_MS));
            }
        } finally {
            isSyncing = false;
        }
    }

    private static async _uploadPending(): Promise<void> {
        const pending = AttendanceRepository.getPending();
        if (pending.length === 0) return;

        console.log(`[SYNC] Uploading ${pending.length} pending record(s)...`);
        let syncedCount = 0;

        for (const record of pending) {
            try {
                const response = await fetch(AppConfig.syncApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': AppConfig.syncApiKey,
                    },
                    body: JSON.stringify(record),
                });

                if (response.ok) {
                    AttendanceRepository.markSynced(record.id);
                    syncedCount++;
                    console.log(`[SYNC] Synced record ${record.id}`);
                } else {
                    console.warn(`[SYNC] Server rejected record ${record.id}: ${response.status}`);
                }
            } catch (err) {
                console.log(`[SYNC] Network error for ${record.id}, will retry`);
            }
        }

        if (syncedCount > 0) {
            await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
        }
    }
}
