/** @format */

import * as React from 'react'

import {OptionData, OptionGroupData, OptionsType} from '../index.interface'

export default function toArray(children: React.ReactNode) {
    const ret: Array<React.ReactElement> = []
    React.Children.forEach(children, c => {
        ret.push(c as React.ReactElement)
    })
    return ret
}

function convertNodeToOption(node: React.ReactElement): OptionData {
    const {
        key,
        props: {children, value, ...restProps},
    } = node as React.ReactElement

    return {key, value: value !== undefined ? value : key, children, ...restProps}
}

export function convertChildrenToData(nodes: React.ReactNode, optionOnly: boolean = false): OptionsType {
    return toArray(nodes)
        .map((node: React.ReactElement): OptionData | OptionGroupData | null => {
            if (!React.isValidElement(node) || !node.type) {
                return null
            }

            const {
                type: {isSelectOptGroup},
                key,
                props: {children, ...restProps},
            } = node as React.ReactElement & {
                type: {isSelectOptGroup?: boolean}
            }

            if (optionOnly || !isSelectOptGroup) {
                return convertNodeToOption(node)
            }

            return {
                key,
                ...restProps,
                options: convertChildrenToData(children),
            }
        })
        .filter(data => data != null) as OptionsType
}
