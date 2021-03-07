# Svelte Forms

Svelte Forms is a lightweight zero dependency libray for handling forms in svelte. 

## Usage

```sh
npm i "@slimkit-ui/svelte-forms"
```

```javascript
import { Form, formValidity, validation } from "@slimkit-ui/svelte-forms";

myForm = new Form('customerForm', {
    name: { value: "Thilanka", validation: {minLength: 5, maxLength: 20}},
    email: { value: '', validation: {email:''} }
})

const submitHandler = () => {
        console.log(myForm.name.value);
        console.log(myForm.email.value);
}
```

```html
<form on:submit|preventDefault={submitHandler} autocomplete="off">
    <label>Full Name: </label>
    <input type="text" use:validation={myForm.name} bind:value={myForm.name.value} />
    {#if myForm.name.showError}
        <p class="help is-danger">Name is invalid</p>
    {/if}

    <label>Email: </label>
    <input type="text" use:validation={myForm.email} bind:value={myForm.email.value} />
    {#if myForm.email.showError}
        <p class="help is-danger">Email is invalid</p>
    {/if}

    <button type="submit"
        disabled={!$formValidity[myForm.formId].isValid}>Submit</button>
</form>
```

### Development

Want to contribute? Great!

Buzz me here thilanka.nuwan89@gmail.com

License
----

MIT


**Free Software, Hell Yeah!**