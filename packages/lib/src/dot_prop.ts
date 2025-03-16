import {
  deleteProperty as deletePropertyOriginal,
  getProperty as getPropertyOriginal,
  setProperty as setPropertyOriginal,
} from 'dot-prop'

export class DotProp {
  static omit = <T extends object>(obj: T, path: string): T => {
    const res = { ...obj }

    deletePropertyOriginal(res, path)

    return res
  }

  static assign = <T extends object, V extends any>(obj: T, path: string, value: V): T => {
    const res = { ...obj }

    setPropertyOriginal(res, path, value)

    return res
  }

  static lookup = <T extends object, V extends unknown>(
    obj: T,
    path: string,
    defaultValue: V
  ): V => {
    return getPropertyOriginal(obj, path, defaultValue) as V
  }

  static rawLookup = getPropertyOriginal

  static assignOrOmit = <T extends object, V extends string | number | boolean>(
    obj: T,
    path: string,
    value: V,
    defaultValue: V
  ): T => {
    let res = { ...obj }

    if (value === defaultValue) {
      res = this.omit(res, path)
    } else {
      res = this.assign(res, path, value)
    }

    const parentPath = path.split('.').slice(0, -1).join('.')

    const parentObj = this.lookup(res, parentPath, {})

    if (Object.keys(parentObj).length < 1) {
      res = this.omit(res, parentPath)
    }

    return res
  }
}
