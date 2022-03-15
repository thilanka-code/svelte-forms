import { writable } from "svelte/store";

export const formValidity = writable({});

/**
 * 
 * @param {*} formId Unique ID for the form
 * @param {*} formFields Fields Warpped in an object.
 * {
        title: {value: 'abcd', validation: { minLength: 3, maxLength: 5 }, validationMessage: 'Value must be between 3 and 5'},
        username: {value: 'th', validation: { maxLength: 2} },
 }
 */
export function Form (formId, formFields) {

    formValidity.update(store => {
        store[formId] = { fields: {}, isValid: false, isDirty: false };

        return store;
    });

    this.formId = formId;
    this.fields = new Map;

    for (let [key, fld] of Object.entries(formFields)) {
        fld = { ...fld, fieldId: key, form: formId }
        this[fld.fieldId] = fld;
        this.fields.set(fld.fieldId, fld);
    }
    
    /**
     * 
     * @returns Key value object of the form fields
     */
    this.getValue = () => {
        let obj = {}
        this.fields.forEach((val, key) =>{
            obj = {...obj, [key]: val.value}
        })
        return obj;
    }
    
    /**
     * @param {*} flds array of field objects [{ myFieldId: { value: "xxx", validation: { minLength: 1 }}}]
     */
    this.addFields = (flds) => {
        for(let fld of flds) {
            let key = Object.keys(fld)[0];
            fld = { ...fld[key], fieldId: key, form: this.formId };
            this[fld.fieldId] = fld;
            this.fields.set(fld.fieldId, fld);
        }
    }

    //Explain below statement
    // this.isValid = () => Array.from(this.fields.values())
    //     .filter(v => typeof v.isValid !== 'undefined' && !v.isValid).length < 1;

}

/**
 * @param {*} formField { value: "", validation: { minLength: 1 } }
 * 
* Action that will handle validation of a field
* Will only run once during the init phase
* Attaches a listener func to the field
* As in use:validation construct of html field
*/
export function validation(node, formField) {
    
    let initialValid = validateField(formField.value, formField.validation);
    formField['isValid'] = initialValid;
    formField['isDirty'] = false;
    formField['showError'] = false;

    formValidity.update(store => {
        
        store[formField.form]['fields'][formField.fieldId] = { isValid: initialValid, isDirty: false, showError: false };
        // Update the validity of whole form
        let isFormValid = true;
        for (const [key, field] of Object.entries(store[formField.form]['fields'])) {
            if (!field.isValid) {
                isFormValid = false;
                break;
            }
        }
        store[formField.form].isValid = isFormValid;

        return store;
    })

    function textFieldListener(event) {
        let isValid = validateField(event.target.value, formField.validation);
        formField['isValid'] = isValid;
        formField['isDirty'] = true;
        formField['showError'] = !isValid;

        formValidity.update(store => {

            store[formField.form]['fields'][formField.fieldId] = { isValid: isValid, isDirty: true, showError: !isValid };
            // Update the validity of whole form
            let isFormValid = true;
            for (const [key, field] of Object.entries(store[formField.form]['fields'])) {
                if (!field.isValid) {
                    isFormValid = false;
                    break;
                }
            }

            store[formField.form].isValid = isFormValid;
            store[formField.form].isDirty = true;
            return store;
        })
    }

    node.addEventListener("input", textFieldListener);

    return {
        destroy() {
            //Remove event listener
            node.removeEventListener("input", textFieldListener);
        }
    };
}

/**
 * This method is called dynamically ($: context). It will validate the value bounded against
 * provided rules in the validation object. This method uses the formField.isDirty so you will
 * need to get it from the component. Svelte Element components usually provide this by means of
 * variable bindings.
 * 
 * @param {*} formField { value: "", validation: { minLength: 1 } }
 */
 export function componentValidation(formField) {

    let isValid = validateField(formField.value, formField.validation);
    formField['isValid'] = isValid;
    formField['showError'] = formField['isDirty'] && !isValid;

    formValidity.update(store => {

        store[formField.form]['fields'][formField.fieldId] = { isValid: isValid, isDirty: formField['isDirty'], showError: formField['isDirty'] && !isValid };
        // Update the validity of whole form
        let isFormValid = true;
        for (const [key, field] of Object.entries(store[formField.form]['fields'])) {
            if (!field.isValid) {
                isFormValid = false;
                break;
            }
        }

        store[formField.form].isValid = isFormValid;
        store[formField.form].isDirty = formField['isDirty'];
        return store;
    })
}

/**
 * Iterate over all fields and update if form is valid or not. Usually this should be called after bounded values
 * are updated manually using javascript (programtically)
 * @param {Reference to Form instance which needs to be updated} form
 */
export function updateFormValidity(form) {

    let tempValidationMap = new Map
    //Store new validity state of each field in a map
    for (let fieldId of form.fields.keys()) {
        let updatedValidity = validateField(form[fieldId].value, form[fieldId].validation);
        tempValidationMap.set(fieldId, updatedValidity)
    }

    // Update the validity of whole form and each field
    formValidity.update(store => { 
        let isFormValid = true;
        let updatedFields = {}
        for (const [key, field] of Object.entries(store[form.formId]['fields'])) {
            field.isValid = tempValidationMap.get(key);
            updatedFields[key] = {...field}
            if (!field.isValid) {
                isFormValid = false;
            }
        }

        store[form.formId].fields = updatedFields
        store[form.formId].isValid = isFormValid;

        return store;
    })
}

/**
 * Action that will perform dynaimc validation on a field
 * @param  value is text value from input
 * @param  rules validation Eg: { minLength: 3, maxLength: 5 }
 */
function validateField(value, rules) {
    
    if(typeof rules === 'string' || rules instanceof String) {
        
    }
    for (let rule of Object.entries(rules)) {
        if (!ruleChecker(value, rule)) {
            return false;
        }
    }
    return true;
}

/**
 * @deprecated
 * This method is used perform the validation upon submitting!
 * 
 * @param obj is shape of {username: {value: 'Thianka'}}
 * @param rules is an object:
 *      {
 *          "email": {length?, email?, notEmpty?, minLength?, maxLength?} },
 *          "username": {minLength: 3}
 *      }
 * 
 */
export function validate(obj, rules) {
    const errors = {};
    for (const field in rules) {
        if (obj.hasOwnProperty(field)) {
            let fieldRules = rules[field]; // {length?, email?, notEmpty?, minLength?, maxLength?} },

            Object.entries(fieldRules).forEach(e => {
                if (!ruleChecker(obj[field].value, e)) { // A rule failed on that field
                    errors[field] = errors[field] ? errors[field] : [];
                    console.log('push...');
                    console.log(e[0]);

                    errors[field].push(e[0]);
                }
            })

        } else {
            console.warn(`No '${field}' in form`);
        }

    }
    console.log('errors');
    console.log(errors);

}

/**
 * @TODO Conditional validation not supported! Eg: Only validate if field is not empty
 * @param {*} value User entered value
 * @param {*} rule Eg: { minLength: 3
 */
function ruleChecker(value, rule) {
    const [ruleType, ruleValue] = rule;

    if (ruleType === 'email') {
        return value 
            && value.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    } else if (ruleType === "minLength") {
        return value && (value + '').length >= ruleValue; //Value is always converted to str before rules
    } else if (ruleType === "maxLength") {
        return (value + '').length <= ruleValue;
    } else if (ruleType === "length") {
        return value && (value + '').length === ruleValue;
    } else {
        console.error(`Unknown validator type '${ruleType}'`);
        return true;
    }
}