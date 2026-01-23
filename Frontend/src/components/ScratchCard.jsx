import React, { useState, useEffect, useRef } from 'react';
import { Gift, Sparkles } from 'lucide-react';

const REWARDS = [
    { id: 1, text: "🍿 FREE Popcorn Bucket!", icon: "🍿" },
    { id: 2, text: "💸 ₹50 Cashback!", icon: "💸" },
    { id: 3, text: "🥤 FREE Small Softdrink (with popcorn)!", icon: "🥤" },
];

export default function ScratchCard() {
    const [scratched, setScratched] = useState(false);
    const [reward, setReward] = useState(null);
    const canvasRef = useRef(null);
    const isDrawing = useRef(false);

    useEffect(() => {
        setReward(REWARDS[Math.floor(Math.random() * REWARDS.length)]);
    }, []);

    useEffect(() => {
        if (reward && !scratched) {
            initCanvas();
        }
    }, [reward, scratched]);

    const initCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#4b5563'; // gray-600
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = '20px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('Scratch Me!', canvas.width / 2, canvas.height / 2 + 7);
    };

    const scratch = (e) => {
        if (!isDrawing.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();

        checkScratched();
    };

    const checkScratched = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let transparentPixels = 0;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] === 0) transparentPixels++;
        }
        if (transparentPixels / (data.length / 4) > 0.4) {
            setScratched(true);
        }
    };

    return (
        <div className="flex flex-col items-center mt-6 p-4 rounded-xl bg-linear-to-br from-indigo-900/40 to-purple-900/40 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-20">
                <Sparkles className="w-12 h-12 text-yellow-400" />
            </div>

            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Gift className="text-yellow-400" />Your Special Reward!
            </h3>

            <div className="relative w-64 h-32 rounded-lg overflow-hidden border-2 border-dashed border-white/20">
                {reward && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white text-gray-900 p-2 text-center">
                        <span className="text-4xl mb-1">{reward.icon}</span>
                        <p className="font-bold text-sm">{reward.text}</p>
                    </div>
                )}

                {!scratched && (
                    <canvas
                        ref={canvasRef}
                        width={256}
                        height={128}
                        className="absolute inset-0 cursor-crosshair touch-none"
                        onMouseDown={() => (isDrawing.current = true)}
                        onMouseUp={() => (isDrawing.current = false)}
                        onMouseMove={scratch}
                        onTouchStart={() => (isDrawing.current = true)}
                        onTouchEnd={() => (isDrawing.current = false)}
                        onTouchMove={scratch}
                    />
                )}
            </div>

            {scratched && (
                <p className="text-yellow-400 mt-4 font-bold animate-bounce">
                    Congratulations! You won!
                </p>
            )}

            {!scratched && (
                <p className="text-gray-400 mt-4 text-xs italic">
                    Scratch this card to reveal your prize!
                </p>
            )}
        </div>
    );
}
