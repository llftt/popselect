/** @format */

import {RawValueType, DefaultValueType} from '../index.interface'

export function toArray<T>(value: T | T[]): T[] {
    if (Array.isArray(value)) {
        return value
    }
    return value !== undefined ? [value] : []
}

/**
 * Convert outer props value into internal value
 */
export function toInnerValue(value: DefaultValueType | undefined): RawValueType[] {
    if (value === undefined || value === null || value === '') {
        return []
    }

    const values = Array.isArray(value) ? value : [value]

    return values as RawValueType[]
}

/**
 * Convert internal value into out event value
 */
export function toOuterValues(valueList: RawValueType[]): RawValueType[] {
    let values: DefaultValueType = valueList
    return values
}

export const isClient = typeof window !== 'undefined' && window.document && window.document.documentElement

/** Is client side and not jsdom */
export const isBrowserClient = process.env.NODE_ENV !== 'test' && isClient

let uuid = 0
/** Get unique id for accessibility usage */
export function getUUID(): number | string {
    let retId: string | number

    // Test never reach
    /* istanbul ignore if */
    if (isBrowserClient) {
        retId = uuid
        uuid += 1
    } else {
        retId = 'TEST_OR_SSR'
    }

    return retId
}
