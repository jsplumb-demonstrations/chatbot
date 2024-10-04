<script>
	export let property
	export let label
	export let placeholder = ""
</script>

<div>{label}</div>
<input type="text" jtk-att={property} placeholder={placeholder}/>
