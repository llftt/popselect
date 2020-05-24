/** @format */

import React from 'react'
import {Button, Popover} from 'antd'

import RcPopSelect, {Option, OptGroup, SelectProps} from './Select'
import './index.less'

export type SelectValue = string[] | number[] | (string | number)[]

export {Option as PopOption, OptGroup as PopOptGroup}

export interface OptionProps {
    disabled?: boolean
    value?: string | number
    title?: string
    children?: React.ReactNode
    className?: string
    style?: React.CSSProperties
}

export interface OptGroupProps {
    label?: React.ReactNode
}

export interface PopSelectProps<T> extends Omit<SelectProps, 'onChange' | 'value' | 'defaultValue'> {
    onChange?: (value: T, option: React.ReactElement<any> | React.ReactElement<any>[]) => void
    value?: T
    defaultValue?: T
    btnDesc: string
    loading?: boolean
    btnStyle?: React.CSSProperties
}

const PopSelect: React.FunctionComponent<PopSelectProps<SelectValue>> = ({
    value,
    defaultValue,
    prefixCls,
    style,
    onChange,
    children,
    groupDesc,
    filterOption,
    btnDesc,
    loading,
    btnStyle,
    ...rest
}) => {
    const onInnerChange = React.useCallback(
        (value: any, options: any) => {
            onChange && onChange(value, options)
        },
        [onChange],
    )

    const memorizeFilterOption = React.useCallback(
        (searchValue: string, option: any) => {
            return typeof filterOption === 'function' && filterOption(searchValue, option)
        },
        [filterOption],
    )
    const innerFilterOption = typeof filterOption === 'function' ? memorizeFilterOption : filterOption
    const content = (
        <RcPopSelect
            prefixCls={prefixCls ? prefixCls : 'ant'}
            style={style}
            onChange={onInnerChange}
            value={value}
            defaultValue={defaultValue}
            groupDesc={groupDesc}
            filterOption={innerFilterOption}
            {...rest}>
            {children}
        </RcPopSelect>
    )

    return (
        <Popover placement="topLeft" content={content} trigger="click">
            <Button style={btnStyle} loading={loading}>
                {loading ? null : btnDesc}
            </Button>
        </Popover>
    )
}

class RefPopSelect extends React.PureComponent<PopSelectProps<SelectValue>> {
    render() {
        return <PopSelect {...this.props} />
    }
}
export default RefPopSelect
