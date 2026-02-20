import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LevelUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    newLevel: number;
    coinsEarned: number;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ isOpen, onClose, newLevel, coinsEarned }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.5, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.5, y: 50 }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="bg-gradient-to-br from-primary to-blue-600 rounded-3xl p-8 text-center max-w-sm w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Animated Stars */}
                        <div className="relative mb-6">
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 360]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="text-8xl"
                            >
                                🎉
                            </motion.div>
                            <motion.div
                                animate={{
                                    y: [0, -20, 0],
                                    opacity: [0, 1, 0]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-4xl"
                            >
                                ✨
                            </motion.div>
                        </div>

                        <h2 className="text-4xl font-black text-white mb-2">
                            ¡SUBISTE DE NIVEL!
                        </h2>

                        <div className="bg-white/20 rounded-2xl p-6 mb-4 backdrop-blur-xl">
                            <p className="text-sm text-white/80 mb-2">Nuevo Nivel</p>
                            <p className="text-6xl font-black text-white">{newLevel}</p>
                        </div>

                        <div className="bg-yellow-500/30 border-2 border-yellow-400 rounded-2xl p-4 mb-6">
                            <p className="text-sm text-white/90 mb-1">Recompensa</p>
                            <p className="text-2xl font-bold text-yellow-300">
                                💰 +{coinsEarned} monedas
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full bg-white text-primary px-6 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-colors"
                        >
                            ¡Genial!
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LevelUpModal;
