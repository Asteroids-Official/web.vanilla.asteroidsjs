import { COMPONENT_OPTIONS } from '../constants'
import { IComponentOptions } from '../interfaces/component-options.interface'

export function Component(options?: IComponentOptions): ClassDecorator {
  options ??= {}
  options.providers ??= []
  options.required ?? []

  return (target) => {
    Reflect.defineMetadata(COMPONENT_OPTIONS, options, target)
  }
}