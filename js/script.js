(() => {

    const canvas = document.getElementById('space');
    const ctx = canvas.getContext('2d');

    const glow = document.getElementById('glow');

    const reduceMotion =
        window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;


    let width = 0;
    let height = 0;

    let stars = [];

    let mouse = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    };


    let shootingStars = [];
    let cursorMeteors = [];


    /* ==========================================
       RESIZE
    ========================================== */

    function resize() {

        const dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );

        width = window.innerWidth;
        height = window.innerHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        canvas.style.width =
            width + 'px';

        canvas.style.height =
            height + 'px';

        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );


        /*
         * Large number of stars
         * for the dense space background
         */

        const count =
            Math.min(
                1150,
                Math.floor(
                    width * height / 1050
                )
            );


        stars = Array.from(
            {
                length: count
            },
            () => ({

                x:
                    Math.random() * width,

                y:
                    Math.random() * height,

                r:
                    Math.random() < .84
                        ? Math.random() * .9 + .18
                        : Math.random() * 1.8 + .8,

                a:
                    Math.random() * .75 + .18,

                s:
                    Math.random() * .025 + .004,

                p:
                    Math.random() *
                    Math.PI * 2,

                z:
                    Math.random() * .95 + .05,

                h:
                    Math.random() < .38
                        ?
                        (
                            Math.random() < .5
                                ?
                                Math.random() * 35 + 245
                                :
                                Math.random() * 25 + 300
                        )
                        :
                        Math.random() * 35 + 205

            })
        );


        shootingStars = [];
        cursorMeteors = [];
    }


    /* ==========================================
       RANDOM SHOOTING STARS
    ========================================== */

    function spawnShootingStar() {

        if (
            shootingStars.length < 2 &&
            Math.random() < .018
        ) {

            shootingStars.push({

                x:
                    Math.random() *
                    width * .9,

                y:
                    Math.random() *
                    height * .48,

                vx:
                    Math.random() * 7 + 5,

                vy:
                    Math.random() * 3 + 2,

                len:
                    Math.random() * 95 + 65,

                life: 0,

                max:
                    Math.random() * 28 + 30

            });
        }
    }


    /* ==========================================
       DRAW EVERYTHING
    ========================================== */

    function draw() {

        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        /*
         * Mouse creates a very subtle
         * parallax effect on the stars.
         */

        const dx =
            (mouse.x - width / 2) /
            width;

        const dy =
            (mouse.y - height / 2) /
            height;


        /* ======================================
           BACKGROUND STARS
        ====================================== */

        for (const s of stars) {

            const x =
                s.x +
                dx * 34 * s.z;

            const y =
                s.y +
                dy * 34 * s.z;


            const twinkle =
                .48 +
                .52 *
                Math.sin(s.p);


            const alpha =
                s.a * twinkle;


            ctx.beginPath();

            ctx.arc(
                x,
                y,
                s.r,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                `hsla(
                    ${s.h},
                    85%,
                    ${s.r > 1.2 ? 88 : 80}%,
                    ${alpha}
                )`;

            ctx.fill();


            /*
             * Bigger stars get a glow
             * and small cross shape.
             */

            if (s.r > 1.65) {

                const halo =
                    ctx.createRadialGradient(
                        x,
                        y,
                        0,
                        x,
                        y,
                        s.r * 7
                    );

                halo.addColorStop(
                    0,
                    `rgba(
                        166,
                        210,
                        255,
                        ${alpha * .18}
                    )`
                );

                halo.addColorStop(
                    1,
                    'rgba(166,210,255,0)'
                );


                ctx.fillStyle = halo;

                ctx.beginPath();

                ctx.arc(
                    x,
                    y,
                    s.r * 7,
                    0,
                    Math.PI * 2
                );

                ctx.fill();


                ctx.strokeStyle =
                    `rgba(
                        190,
                        225,
                        255,
                        ${alpha * .48}
                    )`;

                ctx.lineWidth = .55;


                ctx.beginPath();

                ctx.moveTo(
                    x - s.r * 2.7,
                    y
                );

                ctx.lineTo(
                    x + s.r * 2.7,
                    y
                );

                ctx.moveTo(
                    x,
                    y - s.r * 2.7
                );

                ctx.lineTo(
                    x,
                    y + s.r * 2.7
                );

                ctx.stroke();
            }


            s.p += s.s;
        }


        /* ======================================
           CURSOR METEORS
        ====================================== */

        if (!reduceMotion) {

            cursorMeteors.forEach(m => {

                m.x += m.vx;
                m.y += m.vy;

                m.life++;


                const fade =
                    Math.max(
                        0,
                        1 - m.life / m.max
                    );


                const twinkle =
                    .55 +
                    .45 *
                    Math.sin(
                        m.life * .55 +
                        m.phase
                    );


                const alpha =
                    fade * twinkle;


                ctx.save();


                ctx.translate(
                    m.x,
                    m.y
                );


                ctx.rotate(
                    m.rotation +
                    m.life * .025
                );


                ctx.shadowBlur = 12;


                ctx.shadowColor =
                    `hsla(
                        ${m.h},
                        100%,
                        78%,
                        ${alpha}
                    )`;


                ctx.fillStyle =
                    `hsla(
                        ${m.h},
                        100%,
                        88%,
                        ${alpha}
                    )`;


                const r =
                    m.w *
                    (
                        .65 +
                        .35 * twinkle
                    );


                /*
                 * Four-point star shape
                 */

                ctx.beginPath();

                for (
                    let p = 0;
                    p < 10;
                    p++
                ) {

                    const angle =
                        -Math.PI / 2 +
                        p * Math.PI / 5;

                    const radius =
                        p % 2 === 0
                            ? r * 2.2
                            : r * .8;


                    const x =
                        Math.cos(angle) *
                        radius;

                    const y =
                        Math.sin(angle) *
                        radius;


                    if (p === 0) {

                        ctx.moveTo(
                            x,
                            y
                        );

                    } else {

                        ctx.lineTo(
                            x,
                            y
                        );
                    }
                }

                ctx.closePath();

                ctx.fill();

                ctx.restore();
            });


            cursorMeteors =
                cursorMeteors.filter(
                    m =>
                        m.life < m.max
                );


            /* Add cursor stars */

            spawnShootingStar();


            /* ==================================
               RANDOM SHOOTING STARS
            ================================== */

            shootingStars.forEach(s => {

                s.x += s.vx;
                s.y += s.vy;

                s.life++;


                const fade =
                    Math.min(
                        1,
                        s.life / 5,
                        (s.max - s.life) / 8
                    );


                const trail =
                    ctx.createLinearGradient(
                        s.x -
                            s.vx *
                            s.len /
                            10,

                        s.y -
                            s.vy *
                            s.len /
                            10,

                        s.x,
                        s.y
                    );


                trail.addColorStop(
                    0,
                    'rgba(150,207,255,0)'
                );


                trail.addColorStop(
                    1,
                    `rgba(
                        220,
                        244,
                        255,
                        ${Math.max(
                            0,
                            fade
                        ) * .9}
                    )`
                );


                ctx.strokeStyle =
                    trail;

                ctx.lineWidth = 1.5;


                ctx.beginPath();

                ctx.moveTo(
                    s.x -
                        s.vx *
                        s.len /
                        10,

                    s.y -
                        s.vy *
                        s.len /
                        10
                );

                ctx.lineTo(
                    s.x,
                    s.y
                );

                ctx.stroke();


                /* Shooting star head */

                ctx.beginPath();

                ctx.arc(
                    s.x,
                    s.y,
                    1.5,
                    0,
                    Math.PI * 2
                );


                ctx.fillStyle =
                    `rgba(
                        255,
                        255,
                        255,
                        ${Math.max(
                            0,
                            fade
                        )}
                    )`;

                ctx.fill();
            });


            shootingStars =
                shootingStars.filter(
                    s =>
                        s.life < s.max &&
                        s.x < width + 150 &&
                        s.y < height + 100
                );


            requestAnimationFrame(draw);
        }
    }


    /* ==========================================
       INITIALIZE
    ========================================== */

    resize();

    draw();


    window.addEventListener(
        'resize',
        () => {

            resize();

            if (reduceMotion) {
                draw();
            }

        }
    );


    /* ==========================================
       MOUSE / CURSOR METEORS
    ========================================== */

    window.addEventListener(
        'mousemove',
        e => {

            mouse.x =
                e.clientX;

            mouse.y =
                e.clientY;


            if (!reduceMotion) {

                /*
                 * Spawn several tiny stars
                 * around the cursor.
                 */

                for (
                    let i = 0;
                    i < 1;
                    i++
                ) {

                    const angle =
                        Math.random() *
                        Math.PI *
                        2;


                    const speed =
                        .35 +
                        Math.random() *
                        1.65;


                    cursorMeteors.push({

                        x:
                            e.clientX +
                            (
                                Math.random() -
                                .5
                            ) * 14,

                        y:
                            e.clientY +
                            (
                                Math.random() -
                                .5
                            ) * 14,

                        vx:
                            Math.cos(angle) *
                            speed,

                        vy:
                            Math.sin(angle) *
                            speed,

                        life: 0,

                        max:
                            28 +
                            Math.random() *
                            34,

                        w:
                            1.1 +
                            Math.random() *
                            1.5,

                        h:
                            [
                                190,
                                205,
                                225,
                                275,
                                300,
                                48
                            ][
                                Math.floor(
                                    Math.random() *
                                    6
                                )
                            ],

                        phase:
                            Math.random() *
                            Math.PI *
                            2,

                        rotation:
                            Math.random() *
                            Math.PI *
                            2
                    });
                }


                /*
                 * Prevent too many particles
                 * from building up.
                 */

                if (
                    cursorMeteors.length > 100
                ) {

                    cursorMeteors.splice(
                        0,
                        cursorMeteors.length - 100
                    );
                }
            }


            /* Cursor glow */

            if (glow) {

                glow.style.left =
                    e.clientX + 'px';

                glow.style.top =
                    e.clientY + 'px';
            }

        }
    );


    /* ==========================================
       ACCESSIBILITY
    ========================================== */

    if (reduceMotion) {

        document
            .querySelectorAll(
                '.constellation line'
            )
            .forEach(line => {

                line.style.animation =
                    'none';

            });
    }

})();