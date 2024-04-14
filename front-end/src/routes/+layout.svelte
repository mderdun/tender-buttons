<script>
    import "../app.css";
    import Head from "$lib/components/Head.svelte";
</script>

<div id="body">
<Head />
<div id="slot"><slot /></div>
</div>

<style lang="postcss">
    :global(html) {
        background-color: hsl(49 26.8% 92% /1);
        font-family: 'Vollkorn', serif;
        font-optical-sizing: auto;
    }
    :global(a) {
        text-decoration: none;
        color: inherit;
    }

    #body {
        display: flex;
        flex-direction: column;
    }

    #slot {
        width: 30rem;
        margin: -10rem 0 0 18rem;
    }
</style>