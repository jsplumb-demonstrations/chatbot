<script>
    import MessageInspector from "./MessageInspector.svelte"
    import { PROPERTY_PROMPT } from "../constants"
	import InputField from "./InputField.svelte"
</script>
<MessageInspector/>
<InputField property={PROPERTY_PROMPT} placeholder="prompt" label="Prompt:"/>
