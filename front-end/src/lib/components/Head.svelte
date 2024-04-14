<div id="body">
    <nav id="nav">
        <div>
            <a href="/">
                <div class="button">
                    <div>
                    <p>By</p>
                    <p>Gertrude Stein</p>
                    <p style="font-weight: 900; letter-spacing: 0.12rem">TENDER BUTTONS</p>
                    <p>Objects&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Food</p>
                    <p>Rooms</p>
                    </div>
                </div>
            </a>
        </div>
    </nav>
    <span id="bg-strip"/>
</div>

<style lang="postcss">
    #body {
        display: flex;
        width: 100%;
    }

    #bg-strip {
        background-color: #182D1A;
        height: 10vh;
        width: 100vw;
        position: absolute;
        top: 0;
        left: 0;
        z-index: -1;
    }

    #nav {
        display: flex;
        justify-content: space-between;
        width: 100%;
        color: hsl(49 26.8% 92% /1);
        margin: 0 3rem;
    }

    .button {
        display: flex;
        flex-direction: column;
        background-color: hsl(61.88, 21.62%, 43%);
        border: #182D1A 20px solid;
        width: 190px;
        height: 190px;
        border-radius: 100%;
        justify-content: center;
        align-items: center;
        text-align: center;
        color: #182D1A;
        font-weight: 700;
        letter-spacing: 0.15rem;
        line-height: 0.9;
    }
</style>