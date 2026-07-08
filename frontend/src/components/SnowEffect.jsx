import React, { useEffect, useRef } from 'react';

const SnowEffect = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        let animationFrameId;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 50; // Reduced from 180
        const mouse = { x: 0, y: 0 };

        class Snowflake {
            constructor(x = Math.random() * width, y = Math.random() * -height) {
                this.x = x;
                this.y = y;
                this.vx = (Math.random() - 0.5) * 0.2;
                this.vy = Math.random() * 0.6 + 0.2; // Slower
                this.size = Math.random() * 2 + 0.5; // Smaller
                this.opacity = Math.random() * 0.2 + 0.05; // Much lighter
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.fill();
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.y > height) {
                    this.y = -10;
                    this.x = Math.random() * width;
                }

                // Reduced mouse repulsion
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const repelRange = 60;
                if (dist < repelRange) {
                    const angle = Math.atan2(dy, dx);
                    const force = (repelRange - dist) / repelRange;
                    this.x += Math.cos(angle) * force * 3;
                    this.y += Math.sin(angle) * force * 3;
                }

                this.draw();
            }
        }

        for (let i = 0; i < particleCount; i++) particles.push(new Snowflake());

        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleClick = (e) => {
            // Reduced click spawn
            for (let i = 0; i < 10; i++) {
                particles.push(new Snowflake(e.clientX, e.clientY));
            }
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("click", handleClick);
        window.addEventListener("resize", handleResize);

        function animate() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => p.update());
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
            id="snow-canvas"
            className="fixed inset-0 pointer-events-none z-0 opacity-60"
        />
    );
};

export default SnowEffect;
