/** @format */

import {
    OptionsType as SelectOptionsType,
    OptionData,
    OptionGroupData,
    FlattenOptionData,
    FilterFunc,
    RawValueType,
} from '../index.interface'

import {toArray} from './commonUtil'

function getKey(data: OptionData | OptionGroupData, index: number) {
    const {key} = data
    let value: RawValueType | undefined

    if ('value' in data) {
        value = data['value']
    }

    if (key !== null && key !== undefined) {
        return key
    }
    if (value !== undefined) {
        return value
    }
    return `rc-index-key-${index}`
}

export function flattenOptions(options: SelectOptionsType): FlattenOptionData[] {
    const flattenList: FlattenOptionData[] = []
    let innerCount = 0
    function dig(list: SelectOptionsType, isGroupOption: boolean, groupData?: FlattenOptionData) {
        list.forEach(data => {
            if (isGroupOption || !('options' in data)) {
                // Option
                innerCount++
                // if (groupData) {
                //     //hack Option持有groupData引用
                //     data['groupData'] = groupData
                // }
                flattenList.push({
                    key: getKey(data, flattenList.length),
                    groupOption: isGroupOption,
                    data,
                    groupData: groupData, //|| data['groupData']
                    innerId: innerCount,
                })
            } else {
                innerCount++
                // Option Group
                const group = {
                    key: getKey(data, flattenList.length),
                    group: true,
                    data,
                    innerId: innerCount,
                }
                flattenList.push(group)

                dig(data.options, true, group)
            }
        })
    }

    dig(options, false)

    return flattenList
}

export function findValueOption(values: RawValueType[] | undefined, options: FlattenOptionData[]): OptionData[] {
    if (values === undefined || values.length === 0) return []
    const optionMap: Map<RawValueType, OptionData> = new Map()
    options.forEach(flattenItem => {
        if (!flattenItem.group) {
            const data = flattenItem.data as OptionData
            // Check if match
            optionMap.set(data.value, data)
        }
    })

    return values.map(val => optionMap.get(val)) as OptionData[]
}

//getFlattenOption by values 选择面板显示处理
export function findValueFlattenOption(
    values: RawValueType[] | undefined,
    options: FlattenOptionData[],
): FlattenOptionData[] {
    if (values === undefined || values.length === 0) return []
    const optionMap: Map<RawValueType, FlattenOptionData> = new Map()
    options.forEach(flattenItem => {
        if (!flattenItem.group) {
            const data = flattenItem.data as OptionData
            // Check if match
            optionMap.set(data.value, flattenItem)
        }
    })
    const newOptions: FlattenOptionData[] = values.map(val => optionMap.get(val)) as FlattenOptionData[]
    const set: Set<FlattenOptionData> = new Set()
    newOptions.forEach(flattenItem => {
        if (flattenItem.groupData) {
            set.add(flattenItem.groupData)
        }
        set.add(flattenItem)
    })
    return [...set].sort((a, b) => {
        if (a.innerId < b.innerId) {
            return -1
        } else if (a.innerId === b.innerId) {
            return 0
        } else {
            return 1
        }
    })
}

function toRawString(content: React.ReactNode): string {
    return toArray(content).join('')
}

//将flattendata转化为Optiondata, 用于搜索以及真正数据显示 includeChosen true,选择已选中
export function convertFlattenDatasToOption(
    flattenList: FlattenOptionData[],
    rawValues: Set<RawValueType>,
    optionFilterProp: string = 'value',
    includeChosen: boolean = true,
): SelectOptionsType {
    const options: SelectOptionsType = []
    flattenList.forEach(item => {
        if (item.group) {
            //
            let groupData = item.data as OptionGroupData
            groupData = Object.assign({}, groupData, {options: groupData.options})

            let newGroupDataOptions = new Array<OptionData>()
            groupData.options.forEach(option => {
                const rawValue = getOptionRawData(optionFilterProp, option)
                const isChosen = rawValues.has(rawValue)
                if (isChosen && includeChosen) {
                    newGroupDataOptions.push(option)
                }
                if (!isChosen && !includeChosen) {
                    newGroupDataOptions.push(option)
                }
            })
            groupData.options = newGroupDataOptions
            options.push(groupData)
        } else if (!item.groupOption) {
            let option: OptionData = item.data as OptionData
            options.push(option)
        }
    })
    return options
}
/** Filter single option if match the search text */
function getFilterFunction(optionFilterProp: string) {
    return (searchValue: string, option: OptionData | OptionGroupData) => {
        const lowerSearchText = searchValue.toLowerCase()

        // Group label search
        if ('options' in option) {
            return toRawString(option.label)
                .toLowerCase()
                .includes(lowerSearchText)
        }
        const value = getOptionData(optionFilterProp, option)
        return value.includes(lowerSearchText) && !option.disabled
    }
}

export function getOptionData(optionFilterProp: string, option: OptionData) {
    const rawValue = getOptionRawData(optionFilterProp, option)
    const value = toRawString(rawValue).toLowerCase()
    return value
}

export function getOptionRawData(optionFilterProp: string, option: OptionData) {
    return option[optionFilterProp]
}

/** Filter options and return a new options by the search text */
export function filterOptions(
    searchValue: string,
    options: SelectOptionsType,
    {
        optionFilterProp,
        filterOption,
    }: {optionFilterProp: string; filterOption: boolean | FilterFunc<SelectOptionsType[number]>},
) {
    const filteredOptions: SelectOptionsType = []
    let filterFunc: FilterFunc<SelectOptionsType[number]>

    if (filterOption === false) {
        return options
    }
    if (typeof filterOption === 'function') {
        filterFunc = filterOption
    } else {
        filterFunc = getFilterFunction(optionFilterProp) as FilterFunc<SelectOptionsType[number]>
    }

    options.forEach(item => {
        // Group should check child options
        if ('options' in item) {
            // Check group first
            const matchGroup = filterFunc(searchValue, item)
            if (matchGroup) {
                filteredOptions.push(item)
            } else {
                // Check option
                const subOptions = item.options.filter((subItem :any)=> filterFunc(searchValue, subItem))
                if (subOptions.length) {
                    filteredOptions.push({
                        ...item,
                        options: subOptions,
                    })
                }
            }
            return
        }
        if (filterFunc(searchValue, item)) {
            filteredOptions.push(item)
        }
    })

    return filteredOptions
}

export function getSeparatedContent(text: string, tokens: string[]): string[] | null {
    if (!tokens || !tokens.length) {
        return null
    }
    let match = false
    function separate(str: string, [token, ...restTokens]: string[]): string[] {
        if (!token) {
            return [str]
        }
        const list = str.split(token)
        match = match || list.length > 1
        return list
            .reduce((prevList: string[], unitStr) => [...prevList, ...separate(unitStr, restTokens)], [])
            .filter((unit: string) => unit)
    }
    const list = separate(text, tokens)
    return match ? list : null
}

export function isValueDisabled(value: RawValueType, options: FlattenOptionData[]): boolean {
    const option = findValueOption([value], options)[0]
    if (option && option.disabled !== undefined) {
        return option.disabled
    }

    return false
}
