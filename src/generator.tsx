/** @format */

import * as React from 'react'

import classNames from 'classnames'

import {
    FilterOptions,
    FilterFunc,
    DefaultValueType,
    RawValueType,
    Key,
    FlattenOptionsType,
    SingleType,
    RenderNode,
    OptionData,
} from './index.interface'
import {OptionListProps} from './OptionList'
import {ChosenOptionListProps} from './ChosenList'
import {toInnerValue, toOuterValues, getUUID} from './utils/commonUtil'

import {Input} from 'antd'

export interface SelectProps<OptionsType extends object[], ValueType> {
    prefixCls?: string
    id?: string
    className?: string
    style?: React.CSSProperties
    groupDesc?: string
    // Options
    options?: OptionsType
    children?: React.ReactNode

    // Value
    value?: ValueType
    defaultValue?: ValueType

    // Search
    inputValue?: string
    searchValue?: string
    optionFilterProp?: string
    filterOption?: boolean | FilterFunc<OptionsType[number]>

    autoClearSearchValue?: boolean
    onSearch?: (value: string) => void
    // Icons
    allowClear?: boolean
    clearIcon?: React.ReactNode

    menuItemSelectedIcon?: RenderNode

    listHeight?: number
    listItemHeight?: number

    // Others
    disabled?: boolean
    loading?: boolean
    autoFocus?: boolean
    defaultActiveFirstOption?: boolean
    notFoundContent?: React.ReactNode
    placeholders?: Array<string>

    optionLabelProp?: string

    tabIndex?: number

    onPopupScroll?: React.UIEventHandler<HTMLDivElement>

    onSelect?: (value: SingleType<ValueType>, option: OptionsType) => void
    onDeselect?: (value: SingleType<ValueType>, option: OptionsType) => void
    onInputKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
    onClick?: React.MouseEventHandler
    onChange?: (value: ValueType, option: OptionsType, total: number) => void
    onBlur?: React.FocusEventHandler<HTMLElement>
    onFocus?: React.FocusEventHandler<HTMLElement>
}

export interface GenerateConfig<OptionsType extends object[]> {
    prefixCls: string
    components: {
        optionList: React.FunctionComponent<OptionListProps<OptionsType>>
        chosenList: React.FunctionComponent<ChosenOptionListProps<OptionsType>>
    }
    /** Convert jsx tree into `OptionsType` */
    convertChildrenToData: (children: React.ReactNode) => OptionsType
    /** Flatten nest options into raw option list */
    flattenOptions: (options: OptionsType, props: any) => FlattenOptionsType<OptionsType>
    filterOptions: FilterOptions<OptionsType>
    findValueOption: (values: RawValueType[], options: FlattenOptionsType<OptionsType>) => OptionsType
    findValueFlattenOption: (
        values: RawValueType[],
        options: FlattenOptionsType<OptionsType>,
    ) => FlattenOptionsType<OptionsType>
    convertFlattenDatasToOption: (
        flattenList: FlattenOptionsType<OptionsType>,
        rawValues: Set<RawValueType>,
        optionFilterProp: string,
        includeChosen: boolean,
    ) => OptionsType
    /** Check if a value is disabled */
    isValueDisabled: (value: RawValueType, options: FlattenOptionsType<OptionsType>) => boolean
    omitDOMProps: (props: object) => object
    getOptionRawData: (optionFilterProp: string, option: OptionData) => string
}

export default function generateSelector<
    OptionsType extends {
        value?: RawValueType
        label?: React.ReactNode
        key?: Key
        disabled?: boolean
    }[]
>(config: GenerateConfig<OptionsType>) {
    const {
        prefixCls: defaultPrefixCls,
        components: {optionList: OptionList, chosenList: ChosenList},
        convertChildrenToData,
        flattenOptions,
        filterOptions,
        findValueOption,
        findValueFlattenOption,
        convertFlattenDatasToOption,
        omitDOMProps,
        getOptionRawData,
    } = config

    function Select<ValueType extends DefaultValueType>(
        props: SelectProps<OptionsType, ValueType>,
    ): React.ReactElement {
        const {
            prefixCls = defaultPrefixCls,
            className,
            id,
            options,
            children,
            value,
            defaultValue,
            inputValue,
            searchValue,
            filterOption,
            optionFilterProp = 'value',
            autoClearSearchValue = true,
            onSearch,
            // Icons
            allowClear,
            clearIcon,

            menuItemSelectedIcon,
            placeholders,
            // Others
            disabled,
            loading,
            defaultActiveFirstOption,
            notFoundContent = 'Not Found',
            optionLabelProp,
            // Dropdown
            listHeight = 200,
            listItemHeight = 20,
            // Events
            onPopupScroll,
            onFocus,
            onBlur,
            onChange,
            onSelect,
            onDeselect,
            groupDesc,
            ...restProps
        } = props

        const domProps = omitDOMProps(restProps)

        // Inner id for accessibility usage. Only work in client side
        const [innerId, setInnerId] = React.useState<string>()
        React.useEffect(() => {
            setInnerId(`rc_select_${getUUID()}`)
        }, [])
        const mergedId = id || innerId

        // optionLabelProp
        let mergedOptionLabelProp = optionLabelProp
        if (mergedOptionLabelProp === undefined) {
            mergedOptionLabelProp = options ? 'label' : 'children'
        }

        // ============================= Value ==============================
        const [innerValue, setInnerValue] = React.useState<any>(value || defaultValue || []) //any--> ValueType
        const baseValue = value !== undefined && value !== null ? value : innerValue

        /** Unique raw values */
        const mergedRawValue = React.useMemo<RawValueType[]>(() => toInnerValue(baseValue), [baseValue])
        /** We cache a set of raw values to speed up check */
        const rawValues = React.useMemo<Set<RawValueType>>(() => new Set(mergedRawValue), [mergedRawValue])

        // ============================= Option =============================
        //搜索待选列表
        const [innerSearchValue, setInnerSearchValue] = React.useState('')

        const [innerChosenSearchValue, setInnerChosenSearchValue] = React.useState('')

        let mergedSearchValue = innerSearchValue
        if (searchValue !== undefined) {
            mergedSearchValue = searchValue
        } else if (inputValue) {
            mergedSearchValue = inputValue
        }

        const mergedOptions = React.useMemo<OptionsType>((): OptionsType => {
            let newOptions = options
            if (newOptions === undefined) {
                newOptions = convertChildrenToData(children)
            }
            return newOptions
        }, [options, children, baseValue])

        const mergedFlattenOptions: FlattenOptionsType<OptionsType> = React.useMemo(
            () => flattenOptions(mergedOptions, props),
            [mergedOptions],
        )

        //存储所有options数据
        const allRawValues = React.useMemo<Set<RawValueType>>(() => {
            const values: Array<RawValueType> = []
            mergedFlattenOptions.forEach(option => {
                if (!option['group']) {
                    values.push(getOptionRawData(optionFilterProp, option.data as OptionData))
                }
            })
            return new Set(values)
        }, [mergedFlattenOptions, optionFilterProp])

        /***
         * 显示逻辑
         * 1.根据value--> flatten数据(可用于显示，group包含已选数据，无法搜索)
         * 2. flatten ---> options数据 (解决输入搜索问题)
         * 3. options --> flatten显示数据
         */
        const innerDisplayFlattenOptions: FlattenOptionsType<OptionsType> = React.useMemo(() => {
            const remianInnerValue = [...allRawValues].filter(v => !rawValues.has(v))
            return findValueFlattenOption(remianInnerValue, mergedFlattenOptions)
        }, [rawValues, mergedFlattenOptions])

        const innerDisplayOptions = React.useMemo<OptionsType>(
            () => convertFlattenDatasToOption(innerDisplayFlattenOptions, rawValues, optionFilterProp, false),
            [innerDisplayFlattenOptions, rawValues, optionFilterProp],
        )

        const displayOptions = React.useMemo<OptionsType>(() => {
            if (!mergedSearchValue) {
                return [...innerDisplayOptions] as OptionsType
            }
            const filteredOptions: OptionsType = filterOptions(mergedSearchValue, innerDisplayOptions, {
                optionFilterProp,
                filterOption: filterOption === undefined ? true : filterOption,
            })
            return filteredOptions
        }, [innerDisplayOptions, mergedSearchValue])

        const displayFlattenOptions: FlattenOptionsType<OptionsType> = React.useMemo(
            () => flattenOptions(displayOptions, props),
            [displayOptions],
        )

        //---------------end-------------------

        const innerChosenDisplayFlattenOptions: FlattenOptionsType<OptionsType> = React.useMemo(() => {
            return findValueFlattenOption([...rawValues], mergedFlattenOptions)
        }, [rawValues, mergedFlattenOptions])

        const innerChosenDisplayOptions = React.useMemo<OptionsType>(
            () => convertFlattenDatasToOption(innerChosenDisplayFlattenOptions, rawValues, optionFilterProp, true),
            [innerChosenDisplayFlattenOptions, rawValues, optionFilterProp],
        )

        const chosenDisplayOptions = React.useMemo<OptionsType>(() => {
            if (!innerChosenSearchValue) {
                return [...innerChosenDisplayOptions] as OptionsType
            }
            const filteredOptions: OptionsType = filterOptions(innerChosenSearchValue, innerChosenDisplayOptions, {
                optionFilterProp,
                filterOption: filterOption === undefined ? true : filterOption,
            })
            return filteredOptions
        }, [innerChosenDisplayOptions, innerChosenSearchValue])

        const displayChoosenFlattenOptions: FlattenOptionsType<OptionsType> = React.useMemo(
            () => flattenOptions(chosenDisplayOptions, props),
            [chosenDisplayOptions],
        )

        const triggerSelect = (newValue: RawValueType | RawValueType[], isSelect: boolean) => {
            const selectValue = newValue as SingleType<ValueType>

            const outOption = findValueOption(Array.isArray(newValue) ? newValue : [newValue], mergedFlattenOptions)
            if (isSelect && onSelect) {
                onSelect(selectValue, outOption)
            } else if (!isSelect && onDeselect) {
                onDeselect(selectValue, outOption)
            }
        }

        const triggerChange = (newRawValues: RawValueType[]) => {
            const outValues = toOuterValues(Array.from(newRawValues))
            const outValue: ValueType = outValues as ValueType
            // Skip trigger if prev & current value is both empty
            if (onChange && (mergedRawValue.length !== 0 || outValues.length !== 0)) {
                const outOptions = findValueOption(newRawValues, mergedFlattenOptions)
                onChange(outValue, outOptions, allRawValues.size)
            }
            setInnerValue(outValue)
        }

        //todo
        React.useEffect(() => {
            triggerChange(innerValue)
        }, [allRawValues.size])

        const onInternalSelect = (newValue: RawValueType | RawValueType[], {selected}: {selected: boolean}) => {
            if (disabled) {
                return
            }
            let newRawValue: Set<RawValueType>
            newRawValue = new Set(mergedRawValue)
            if (selected) {
                if (Array.isArray(newValue)) {
                    newValue.forEach(v => {
                        newRawValue.add(v)
                    })
                } else {
                    newRawValue.add(newValue)
                }
            } else {
                if (Array.isArray(newValue)) {
                    newValue.forEach(v => {
                        newRawValue.delete(v)
                    })
                } else {
                    newRawValue.delete(newValue)
                }
            }
            triggerChange(Array.from(newRawValue))
            triggerSelect(newValue, selected)
            if (!autoClearSearchValue) {
                setInnerSearchValue('')
            }
        }

        // ============================= Search =============================
        const triggerSearch = (searchText: string) => {
            let ret = true
            let newSearchText = searchText
            ret = false
            setInnerSearchValue(newSearchText)
            if (onSearch && mergedSearchValue !== newSearchText) {
                onSearch(newSearchText)
            }
            return ret
        }

        /** 不触发onSeach */
        const triggerChosenSearch = (searchText: string) => {
            let ret = true
            let newSearchText = searchText
            ret = false
            setInnerChosenSearchValue(newSearchText)
            return ret
        }

        const mergedDefaultActiveFirstOption = defaultActiveFirstOption !== undefined ? defaultActiveFirstOption : true
        //============================input============================
        const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            triggerSearch(event.target['value'])
        }

        const onInputChosenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            triggerChosenSearch(event.target['value'])
        }

        //全部选择逻辑处理
        const onChooseAll = () => {
            triggerChange(Array.from(allRawValues))
        }
        let optionListHeight = listHeight - 10
        const popupNode = (
            <OptionList
                prefixCls={prefixCls}
                groupDesc={groupDesc}
                id={mergedId || ''}
                childrenAsData={!options}
                flattenOptions={displayFlattenOptions}
                values={rawValues}
                height={optionListHeight}
                itemHeight={listItemHeight}
                onSelect={onInternalSelect}
                defaultActiveFirstOption={mergedDefaultActiveFirstOption}
                notFoundContent={notFoundContent}
                onScroll={onPopupScroll}
                searchValue={mergedSearchValue}
                menuItemSelectedIcon={menuItemSelectedIcon}
            />
        )

        const chosenNode = (
            <ChosenList
                flattenOptions={displayChoosenFlattenOptions}
                prefixCls={prefixCls}
                childrenAsData={!options}
                groupDesc={groupDesc}
                values={rawValues}
                height={optionListHeight}
                itemHeight={listItemHeight}
                onSelect={onInternalSelect}
                optionFilterProp={optionFilterProp}
                notFoundContent={notFoundContent}
            />
        )

        // ============================= Render =============================
        const mergedClassName = classNames(prefixCls, className, {
            [`${prefixCls}-allow-clear`]: allowClear,
            [`${prefixCls}-disabled`]: disabled,
            [`${prefixCls}-loading`]: loading,
        })

        return (
            <div className={mergedClassName} {...domProps}>
                <div className={`${prefixCls}-selection-area`}>
                    <div className={`${prefixCls}-selection-item`}>
                        <div className="popselect-interset">
                            <div className={`popselect-interset-input`}>
                                <Input
                                    id={mergedId || ''}
                                    disabled={disabled || false}
                                    value={mergedSearchValue}
                                    onChange={onInputChange}
                                    autoFocus={true}
                                    placeholder={placeholders ? placeholders[0] : undefined}
                                />
                            </div>
                            <div className="popselect-interset-btns">
                                <button onClick={onChooseAll} className="popselect-interset-btn ant-btn">
                                    全选
                                </button>
                                <button
                                    className="popselect-interset-btn ant-btn"
                                    onClick={() => {
                                        triggerChange([])
                                    }}>
                                    清空
                                </button>
                            </div>
                        </div>
                        <div className="popselect-list-container" style={{height: listHeight}}>
                            <div className="code-box-title">待选{groupDesc}</div>
                            {popupNode}
                        </div>
                    </div>
                    <div className={`${prefixCls}-selection-item`}>
                        <div className="popselect-interset">
                            <div className="popselect-interset-desc">
                                已选{groupDesc}:<span className="interset-num">{rawValues.size}</span>个
                            </div>
                            <div className={`popselect-interset-input`}>
                                <Input
                                    id={mergedId || ''}
                                    disabled={disabled || false}
                                    value={innerChosenSearchValue}
                                    onChange={onInputChosenChange}
                                    placeholder={
                                        placeholders
                                            ? placeholders.length > 1
                                                ? placeholders[1]
                                                : placeholders[0]
                                            : undefined
                                    }
                                />
                            </div>
                        </div>
                        <div className="popselect-list-container" style={{height: listHeight}}>
                            <div className="code-box-title">已选{groupDesc}</div>
                            {chosenNode}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return Select
}
