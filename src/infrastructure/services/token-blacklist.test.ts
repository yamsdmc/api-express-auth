import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {InMemoryTokenBlacklist} from "@infrastructure/services/token-blacklist";
import {CONFIG} from "../../config";

describe('InMemoryTokenBlacklist', () => {
    let blacklist: InMemoryTokenBlacklist;

    beforeEach(() => {
        vi.useFakeTimers();
        blacklist = new InMemoryTokenBlacklist();
    });

    afterEach(() => {
        blacklist.stop();
        vi.useRealTimers();
    });

    it('should blacklist a token', async () => {
        await blacklist.addToBlacklist('token123');
        expect(await blacklist.isBlacklisted('token123')).toBe(true);
    });

    it('should not find non-blacklisted token', async () => {
        expect(await blacklist.isBlacklisted('nonexistent')).toBe(false);
    });

    it('should remove expired tokens during cleanup', async () => {
        await blacklist.addToBlacklist('expired-token');

        // Avance le temps après expiration
        vi.advanceTimersByTime(CONFIG.JWT.ACCESS_TOKEN_EXPIRY_SECONDS * 1000 + 1000);

        expect(await blacklist.isBlacklisted('expired-token')).toBe(false);
    });

    it('should automatically cleanup expired tokens', async () => {
        await blacklist.addToBlacklist('token-to-cleanup');

        // Avancer au-delà de l'expiration du token
        vi.advanceTimersByTime(CONFIG.JWT.ACCESS_TOKEN_EXPIRY_SECONDS * 1000 + 1000);

        // Avancer jusqu'au prochain nettoyage
        vi.advanceTimersByTime(CONFIG.CLEANUP.INTERVAL_MS);

        expect(await blacklist.isBlacklisted('token-to-cleanup')).toBe(false);
    });
});