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
</style>