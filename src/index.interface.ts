/** @format */

export type RenderNode = React.ReactNode | ((props: any) => React.ReactNode)

// ======================== Option ========================
export interface OptionData {
    key?: Key
    disabled?: boolean
    value: Key
    title?: string
    className?: string
    style?: React.CSSProperties
    label?: React.ReactNode
    children?: React.ReactNode
    [key: string]:any
}

export interface OptionGroupData {
    key?: Key
    label?: React.ReactNode
    options: OptionData[]
    className?: string
    style?: React.CSSProperties
}

export type OptionsType = (OptionData | OptionGroupData)[]

export interface FlattenOptionData {
    group?: boolean
    groupOption?: boolean
    key: string | number
    data: OptionData | OptionGroupData
    groupData?: FlattenOptionData
    innerId: number
}

// =================================== Shared Type ===================================
export type Key = string | number

export type RawValueType = string | number

export type DefaultValueType = RawValueType | RawValueType[]

export type SingleType<MixType> = MixType extends (infer Single)[] ? Single : MixType

// ==================================== Generator ====================================
export type FilterOptions<OptionsType extends object[]> = (
    searchValue: string,
    options: OptionsType,
    /** Component props, since Select & TreeSelect use different prop name, use any here */
    config: {optionFilterProp: string; filterOption: boolean | FilterFunc<OptionsType[number]>},
) => OptionsType

export type FilterFunc<OptionType> = (inputValue: string, option?: OptionType) => boolean

export type FlattenOptionsType<OptionsType extends object[] = object[]> = {
    key: Key
    data: OptionsType[number]
    innerId: number
    /** Used for customize data */
    [name: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
}[]
