import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

export default function FinancialPlanner() {
    const [journey, setJourney] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initializeJourney = async () => {
            try {
                const deviceId = localStorage.getItem('device_id') || `dev_${Date.now()}`;
                localStorage.setItem('device_id', deviceId);

                const { data } = await base44.functions.invoke('advanceJourneyPublic', {
                    device_id: deviceId,
                    initial_state: 'discovery_not_started',
                });

                if (data.journey) {
                    setJourney(data.journey);
                    localStorage.setItem('active_journey_id', data.journey.id);
                    window.location.href = createPageUrl('FinancialAnalysis', { journey_id: data.journey.id });
                } else {
                    throw new Error('Failed to initialize journey');
                }
            } catch (err) {
                setError(err.message);
                console.error("Journey initialization failed:", err);
            } finally {
                setLoading(false);
            }
        };

        initializeJourney();
    }, []);

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {loading && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                        <p className="text-lg">Подготвяме Вашия финансов план...</p>
                    </div>
                )}
                {error && (
                    <div className="text-center text-red-400">
                        <p className="text-xl font-bold mb-2">Грешка</p>
                        <p>{error}</p>
                    </div>
                )}
                {journey && !loading && (
                     <div className="text-center">
                        <p className="text-xl font-bold mb-2">Пренасочваме ви...</p>
                        <p>Вашият план е готов. Моля, изчакайте.</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}