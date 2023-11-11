export interface PropertyContext {
  previousValue: any,
  changedProperty: string
}

export type SetValueTypeFn<E> = <Key extends string & keyof E>(
  property: Key,
  value: E[Key]
) => void

export type GetValueTypeFn<E> = <Key extends string & keyof E>(
  property: Key
) => E[Key]

export type RegisterTypeFn<E> = <Key extends string & keyof E>(
  fn: (callback: any, propertyContext?: PropertyContext) => void,
  crmField: Key[],
  otherProperties?: Key[],
) => void

export type UnsubscribeTypeFn<E> = <Key extends string & keyof E>(
  event: Key,
  fn: (message: E[Key]) => void
) => void

export type GetEventContextTypeFn = () => Xrm.Events.EventContext
export type GetFormContextTypeFn = () => Xrm.FormContext
export type GetContextEntityNameFn = () => string

export type CompleteRegistrationFn = () => void

export type Store<E> = {
  setValue: SetValueTypeFn<E>
  getValue: GetValueTypeFn<E>
  unsubscribe: UnsubscribeTypeFn<E>
  register: RegisterTypeFn<E>
  getEventContext: GetEventContextTypeFn
  getFormContext: GetFormContextTypeFn
  getContextEntityName: GetContextEntityNameFn
  completeRegistration: CompleteRegistrationFn
}

export function CreateStore<E>(eventContext: Xrm.Events.EventContext) : Store<E> {
  const handlers: { [key: string]: Function[] } = {}
  const dataStorage: { [key: string]: any } = {}
  const attachedAttributes: string[] = []
  let self: Store<E>

  const store = {
    setValue: (property:string, value: any) => {
      var propertyContext: PropertyContext = { previousValue: dataStorage[property], changedProperty: property };

      dataStorage[property] = value;

      if(handlers[property]) {
        handlers[property].forEach(h => h(self, propertyContext));
      }
    },

    getValue: (property: string) => {
      if(dataStorage[property] != undefined) {
        return dataStorage[property];
      }
      return null;
    }

    register: (callback, crmFields, otherProperties = null) => {
      if(crmFields) {
        crmFields.forEach((field: string) => {
          
          if(!attachedAttributes.includes(field)) {
            const crmAttribute = eventContext.getFormContext().getAttribute(field)
            if(!crmAttribute) {
              return
            }

            dataStorage[field] = crmAttribute.getValue();

            const onChange = () => {
              const propertyContext: PropertyContext = { previousValue: dataStorage[field], changedProperty: field };
              const crmAttribute = eventContext.getFormContext().getAttribute(field)
              dataStorage[field] = crmAttribute.getValue();
              if(handlers[field]) {
                handlers[field].forEach(h => h(self, propertyContext));
              }
            };

            crmAttribute.addOnChange(onChange);
            attachedAttributes.push(field);
          }
          
          const list = handlers[field] ?? [];
          if(!list.includes(callback)) {
            list.push(callback);
          }
          handlers[field] = list;
        });
      }
    }
  }
}