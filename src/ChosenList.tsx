/** @format */

import React from 'react'
import List from 'rc-virtual-list'
import classNames from 'classnames'

import {
    RawValueType,
    OptionsType as SelectOptionsType,
    FlattenOptionsType,
    FlattenOptionData as SelectFlattenOptionData,
    OptionData,
    OptionGroupData,
} from './index.interface'
import {getOptionRawData} from './utils/valueUtil'

const ICON_ADD = (
    <span role="img" aria-label="plus" className="anticon anticon-plus">
        <svg
            viewBox="64 64 896 896"
            focusable="false"
            data-icon="plus"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true">
            <defs>
                <style />
            </defs>
            <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z" />
            <path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z" />
        </svg>
    </span>
)

const ICON_MINUS = (
    <span role="img" aria-label="minus" className="anticon anticon-minus">
        <svg
            viewBox="64 64 896 896"
            focusable="false"
            data-icon="minus"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true">
            <path d="M872 474H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h720c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z" />
        </svg>
    </span>
)
export interface ChosenOptionListProps<OptionsType extends object[]> {
    prefixCls: string
    flattenOptions: FlattenOptionsType<OptionsType>
    groupDesc?: string
    height: number
    itemHeight: number
    values: Set<RawValueType>
    notFoundContent?: React.ReactNode
    childrenAsData: boolean
    optionFilterProp: string
    onSelect: (value: RawValueType | RawValueType[], option: {selected: boolean}) => void
}

const ChosenOptionList: React.FunctionComponent<ChosenOptionListProps<SelectOptionsType>> = ({
    prefixCls,
    flattenOptions,
    childrenAsData,
    values,
    height,
    itemHeight,
    onSelect,
    groupDesc,
    optionFilterProp,
    notFoundContent,
}) => {
    const itemPrefixCls = prefixCls + '-item'
    const listRef = React.useRef<List>(null)

    const onListMouseDown: React.MouseEventHandler<HTMLDivElement> = event => {
        event.preventDefault()
    }
    // ========================== Values ==========================
    const onSelectValue = (value: RawValueType) => {
        if (value !== null) {
            onSelect(value, {selected: !values.has(value)})
        }
    }

    // ========================== Render ==========================
    if (flattenOptions.length === 0) {
        return (
            <div role="listbox" className={`${itemPrefixCls}-empty`} onMouseDown={onListMouseDown}>
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
                onMouseDown={onListMouseDown}>
                {({group, groupOption, data, groupData: groupFlattenData}) => {
                    const {label, key} = data
                    // Group
                    if (group) {
                        //options全部选中
                        const groupData: OptionGroupData = data as OptionGroupData
                        const optionsData = groupData.options.map(option => option.value)
                        const filterOptionsData = optionsData.filter(v => values.has(v))
                        return (
                            <div
                                className={classNames(
                                    itemPrefixCls,
                                    `${itemPrefixCls}-group`,
                                    'selected popselect-list-item',
                                )}
                                onClick={() => {
                                    onSelect(filterOptionsData, {selected: false})
                                }}>
                                {label !== undefined ? label : key}
                                {`${groupDesc !== undefined ? `(${filterOptionsData.length}${groupDesc}）` : ''}`}
                                {selectIcon}
                            </div>
                        )
                    }
                    let {disabled, value, children} = data as OptionData
                    // Option
                    const selected = values.has(value)
                    const optionPrefixCls = `${itemPrefixCls}-option`
                    const optionClassName = classNames(itemPrefixCls, optionPrefixCls, 'popselect-list-item chosen', {
                        [`grouped`]: groupOption,
                        [`disabled`]: disabled,
                        [`selected`]: selected,
                    })
                    const mergedLabel = childrenAsData ? children : label
                    return (
                        <div
                            aria-selected={selected}
                            className={optionClassName}
                            onClick={() => {
                                if (!disabled && !groupOption) {
                                    onSelectValue(value)
                                }
                            }}>
                            <div className={`${optionPrefixCls}-content`}>{mergedLabel || value}</div>
                            {groupOption ? (
                                <div className="popselect-operation">
                                    <span
                                        className="popselect-operation-icon"
                                        title={'移除'}
                                        onClick={() => {
                                            onSelectValue(value)
                                        }}>
                                        {ICON_MINUS}
                                    </span>

                                    <span
                                        className="popselect-operation-icon"
                                        title={'反选'}
                                        onClick={() => {
                                            if (groupFlattenData) {
                                                const values = (groupFlattenData.data as OptionGroupData).options.map(
                                                    option => {
                                                        return getOptionRawData(optionFilterProp, option)
                                                    },
                                                )
                                                const filterOptionsData = values.filter(v => v !== value)

                                                if (filterOptionsData.length > 0) {
                                                    onSelect(filterOptionsData, {selected: false})
                                                }
                                            }
                                        }}>
                                        {ICON_ADD}
                                    </span>
                                </div>
                            ) : null}
                            {selected && !groupOption ? selectIcon : null}
                        </div>
                    )
                }}
            </List>
        </React.Fragment>
    )
}

ChosenOptionList.displayName = 'ChosenOptionList'

export default ChosenOptionList
