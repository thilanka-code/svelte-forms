<script>
    import { Form, validation, formValidity, updateFormValidity } from '../src/index';

    let myForm = new Form('customerForm', {
    name: { value: '', validation: {minLength: 1}},
    age: { value: '10', validation: {minLength:1} }
    });

    setTimeout(()=>{
        myForm.name.value='xx'
        updateFormValidity(myForm)
    },1000)

const submitHandler = () => {
        console.log(myForm.name.value);
        console.log(myForm.age.value);
}
</script>
<p>Hello world!</p>

<form on:submit|preventDefault={submitHandler} autocomplete="off">
    <label for="name">Name</label>
    <input type="text" id="name" use:validation={myForm.name} bind:value={myForm.name.value}>
    {#if myForm.name.showError}
        <p class="help is-danger">Name is invalid</p>
    {/if}
    <br>

    <label for="age">Age</label>
    <input type="number" id="age" use:validation={myForm.age} bind:value={myForm.age.value}>
    {#if myForm.age.showError}
        <p class="help is-danger">Age is invalid</p>
    {/if}

    <button type="submit"
    disabled={!$formValidity[myForm.formId].isValid}>Submit</button>

</form>