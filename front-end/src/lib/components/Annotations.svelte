<script lang="ts">
    export let word: string;
    export let data: { [key: string]: string };
</script>

<div class="word-annotation-box">
    <h3>{word}</h3>
    <table>
        {#each Object.entries(data) as [key, value]}
            <tr>
                <td>{key}</td>
                <td>{value}</td>
            </tr>
        {/each}
    </table>
</div>

<style>
    .word-annotation-box {
        position: absolute;
        background-color: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 16px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        max-width: 300px;
        z-index: 100;
    }
</style>