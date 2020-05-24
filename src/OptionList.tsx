/** @format */

import React from 'react'
import List from 'rc-virtual-list'
import classNames from 'classnames'
import {
    RawValueType,
    OptionsType as SelectOptionsType,
    FlattenOptionsType,
    FlattenOptionData as SelectFlattenOptionData,
    RenderNode,
    OptionData,
    OptionGroupData,
} from './index.interface'

export interface OptionListProps<OptionsType extends object[]> {
    prefixCls: string
    id: string
    groupDesc?: string
    flattenOptions: FlattenOptionsType<OptionsType>
    height: number
    itemHeight: number
    values: Set<RawValueType>
    defaultActiveFirstOption?: boolean
    notFoundContent?: React.ReactNode
    menuItemSelectedIcon?: RenderNode
    childrenAsData: boolean
    searchValue: string
    onSelect: (value: RawValueType | RawValueType[], option: {selected: boolean}) => void

    onScroll?: React.UIEventHandler<HTMLDivElement>
}

const OptionList: React.FunctionComponent<OptionListProps<SelectOptionsType>> = (
    {
        prefixCls,
        id,
        flattenOptions,
        childrenAsData,
        values,
        searchValue,
        defaultActiveFirstOption,
        height,
        itemHeight,
        notFoundContent,
        menuItemSelectedIcon,
        onSelect,
        onScroll,
        groupDesc,
    },
) => {
    const itemPrefixCls = prefixCls + '-item'
    const listRef = React.useRef<List>(null)

    const onListMouseDown: React.MouseEventHandler<HTMLDivElement> = event => {
        event.preventDefault()
    }

    // ========================== Active ==========================
    const getEnabledActiveIndex = (index: number, offset: number = 1): number => {
        const len = flattenOptions.length

        for (let i = 0; i < len; i += 1) {
            const current = (index + i * offset + len) % len

            const {group, data} = flattenOptions[current]
            if (!group && !(data as OptionData).disabled) {
                return current
            }
        }

        return -1
    }

    const [activeIndex, setActiveIndex] = React.useState(() => getEnabledActiveIndex(0))
    const setActive = (index: number) => {
        setActiveIndex(index)

        // Trigger active event
        const flattenItem = flattenOptions[index]
        if (!flattenItem) {
            return
        }
    }

    // Auto active first item when list length or searchValue changed
    React.useEffect(() => {
        setActive(defaultActiveFirstOption !== false ? getEnabledActiveIndex(0) : -1)
    }, [flattenOptions.length, searchValue])

    // ========================== Values ==========================
    const onSelectValue = (value: RawValueType) => {
        if (value !== null) {
            onSelect(value, {selected: !values.has(value)})
        }
    }

    // ========================== Render ==========================
    if (flattenOptions.length === 0) {
        return (
            <div role="listbox" id={`${id}_list`} className={`${itemPrefixCls}-empty`} onMouseDown={onListMouseDown}>
                {notFoundContent}
            </div>
        )
    }

    const selectIcon = <span className="popselect-selected-icon">{'✓'}</span>

    return (
        <React.Fragment>
            <List<SelectFlattenOptionData>
                prefixCls="popselect"
                itemKey="key"
                ref={listRef}
                data={flattenOptions}
                height={height}
                itemHeight={itemHeight}
                fullHeight={false}
                onMouseDown={onListMouseDown}
                onScroll={onScroll}>
                {({group, groupOption, data}, itemIndex) => {
                    const {label, key} = data

                    // Group
                    if (group) {
                        const groupData: OptionGroupData = data as OptionGroupData
                        const optionsData = groupData.options.map(option => option.value)
                        const filterOptionsData = optionsData.filter(v => values.has(v))
                        const selected = filterOptionsData.length === optionsData.length
                        return (
                            <div
                                className={classNames(itemPrefixCls, `${itemPrefixCls}-group`, 'popselect-list-item', {
                                    [`selected`]: selected,
                                })}
                                onClick={() => {
                                    onSelect(optionsData, {selected: !selected})
                                }}>
                                {label !== undefined ? label : key}
                                {`${
                                    groupDesc !== undefined
                                        ? `(${(data as OptionGroupData).options.length}${groupDesc}）`
                                        : ''
                                }`}
                                {selected ? selectIcon : null}
                            </div>
                        )
                    }

                    let {disabled, value, children} = data as OptionData

                    // Option
                    const selected = values.has(value)

                    const optionPrefixCls = `${itemPrefixCls}-option`
                    const optionClassName = classNames(itemPrefixCls, optionPrefixCls, 'popselect-list-item', {
                        [`grouped`]: groupOption,
                        [`active`]: activeIndex === itemIndex && !disabled,
                        [`disabled`]: disabled,
                        [`selected`]: selected,
                    })

                    const mergedLabel = childrenAsData ? children : label

                    const iconVisible = !menuItemSelectedIcon || typeof menuItemSelectedIcon === 'function' || selected

                    return (
                        <div
                            aria-selected={selected}
                            className={optionClassName}
                            onMouseMove={() => {
                                if (activeIndex === itemIndex || disabled) {
                                    return
                                }
                                setActive(itemIndex)
                            }}
                            onClick={() => {
                                if (!disabled) {
                                    onSelectValue(value)
                                }
                            }}>
                            <div className={`${optionPrefixCls}-content`}>{mergedLabel || value}</div>
                            {React.isValidElement(menuItemSelectedIcon) || selected}
                            {iconVisible && selected ? selectIcon : null}
                        </div>
                    )
                }}
            </List>
        </React.Fragment>
    )
}

OptionList.displayName = 'OptionList'

export default OptionList
