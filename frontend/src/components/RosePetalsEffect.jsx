import React, { useEffect, useRef } from 'react';

const RosePetalsEffect = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        let animationFrameId;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const petals = [];
        const petalCount = 150;
        const mouse = { x: -1000, y: -1000 };

        // Vibrant high-contrast petal colors
        function randomPetalColor() {
            const colors = [
                '#e60023', // Deep Red
                '#c90016', // Ruby 
                '#ff0033', // Bright Red
                '#ffb7b2', // Pale Rose (for variation)
                '#ffd700'  // Gold (Contrast)
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        // Realistic rose petal shape
        class Petal {
            constructor(x = Math.random() * width, y = Math.random() * -height) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 6 + 5;
                this.vy = Math.random() * 1.2 + 0.5;
                this.vx = (Math.random() - 0.5) * 1;
                this.angle = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.02;
                this.color = randomPetalColor();
                this.opacity = Math.random() * 0.7 + 0.3;
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);

                // Realistic petal shape
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(this.size * 0.5, -this.size * 1.2, this.size * 1.2, this.size * 0.5, 0, this.size);
                ctx.bezierCurveTo(-this.size * 1.2, this.size * 0.5, -this.size * 0.5, -this.size * 0.8, 0, 0);

                // Gradient fill for depth
                const gradient = ctx.createRadialGradient(0, this.size / 2, this.size / 5, 0, this.size / 2, this.size);
                gradient.addColorStop(0, 'rgba(255,255,255,0.1)');
                gradient.addColorStop(1, this.color);

                ctx.fillStyle = gradient;
                ctx.globalAlpha = this.opacity;
                ctx.fill();
                ctx.restore();
            }

            update() {
                // Mouse repulsion
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const repelRange = 100;
                if (dist < repelRange) {
                    const angle = Math.atan2(dy, dx);
                    const force = (repelRange - dist) / repelRange;
                    this.x += Math.cos(angle) * force * 5;
                    this.y += Math.sin(angle) * force * 5;
                }

                // Move petal
                this.x += this.vx;
                this.y += this.vy;
                this.angle += this.rotationSpeed;

                // Reset if out of screen
                if (this.y > height + 20 || this.x < -30 || this.x > width + 30) {
                    this.y = -20;
                    this.x = Math.random() * width;
                    this.size = Math.random() * 6 + 5;
                    this.vy = Math.random() * 1.2 + 0.5;
                    this.vx = (Math.random() - 0.5) * 1;
                    this.angle = Math.random() * Math.PI * 2;
                    this.rotationSpeed = (Math.random() - 0.5) * 0.02;
                    this.color = randomPetalColor();
                    this.opacity = Math.random() * 0.7 + 0.3;
                }

                this.draw();
            }
        }

        // Initialize petals
        for (let i = 0; i < petalCount; i++) petals.push(new Petal());

        // Mouse tracking
        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        // Click to spawn more petals
        const handleClick = (e) => {
            for (let i = 0; i < 15; i++) {
                petals.push(new Petal(e.clientX, e.clientY));
            }
        };

        // Handle window resize
        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("click", handleClick);
        window.addEventListener("resize", handleResize);

        // Animation
        function animate() {
            ctx.clearRect(0, 0, width, height);

            petals.forEach(p => p.update());

            // Keep petal count manageable
            if (petals.length > 500) petals.splice(0, petals.length - 500);

            animationFrameId = requestAnimationFrame(animate);
        }

        animate();

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("click", handleClick);
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            id="rose-petals-canvas"
            className="fixed inset-0 pointer-events-none z-0 opacity-90"
        />
    );
};

export default RosePetalsEffect;
