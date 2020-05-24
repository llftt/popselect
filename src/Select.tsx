/** @format */

import React from 'react'

import SelectOptionList from './OptionList'
import ChosenList from './ChosenList'
import Option from './Option'
import OptGroup from './OptGroup'
import {convertChildrenToData as convertSelectChildrenToData} from './utils/legacyUtil'
import {
    filterOptions as selectDefaultFilterOptions,
    isValueDisabled as isSelectValueDisabled,
    findValueOption as findSelectValueOption,
    findValueFlattenOption,
    flattenOptions,
    convertFlattenDatasToOption,
    getOptionRawData,
} from './utils/valueUtil'
import generateSelector, {SelectProps as InnerSelectProps} from './generator'
import {DefaultValueType, OptionsType as SelectOptionsType} from './index.interface'

const OMIT_PROPS = ['removeIcon', 'placeholder', 'autoFocus', 'choiceTransitionName', 'onInputKeyDown']

const RefSelect = generateSelector<SelectOptionsType>({
    prefixCls: 'popselect',
    components: {
        optionList: SelectOptionList,
        chosenList: ChosenList,
    },
    convertChildrenToData: convertSelectChildrenToData,
    flattenOptions,
    filterOptions: selectDefaultFilterOptions,
    isValueDisabled: isSelectValueDisabled,
    findValueOption: findSelectValueOption,
    findValueFlattenOption,
    convertFlattenDatasToOption,
    omitDOMProps: (props: object) => {
        const cloneProps:any = {...props}
        OMIT_PROPS.forEach(prop => {
            delete cloneProps[prop]
        })

        return cloneProps
    },
    getOptionRawData,
})

const EMPTY_ICON = (
    <li
        role="option"
        unselectable="on"
        className="ant-select-dropdown-menu-item ant-select-dropdown-menu-item-disabled"
        aria-disabled="true"
        aria-selected="false"
        style={{userSelect: 'none'}}>
        <div className="ant-empty ant-empty-normal ant-empty-small">
            <div className="ant-empty-image">
                <img
                    alt="暂无数据"
                    src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCA2NCA0MSIgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAxKSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgIDxlbGxpcHNlIGZpbGw9IiNGNUY1RjUiIGN4PSIzMiIgY3k9IjMzIiByeD0iMzIiIHJ5PSI3Ii8+CiAgICA8ZyBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0iI0Q5RDlEOSI+CiAgICAgIDxwYXRoIGQ9Ik01NSAxMi43Nkw0NC44NTQgMS4yNThDNDQuMzY3LjQ3NCA0My42NTYgMCA0Mi45MDcgMEgyMS4wOTNjLS43NDkgMC0xLjQ2LjQ3NC0xLjk0NyAxLjI1N0w5IDEyLjc2MVYyMmg0NnYtOS4yNHoiLz4KICAgICAgPHBhdGggZD0iTTQxLjYxMyAxNS45MzFjMC0xLjYwNS45OTQtMi45MyAyLjIyNy0yLjkzMUg1NXYxOC4xMzdDNTUgMzMuMjYgNTMuNjggMzUgNTIuMDUgMzVoLTQwLjFDMTAuMzIgMzUgOSAzMy4yNTkgOSAzMS4xMzdWMTNoMTEuMTZjMS4yMzMgMCAyLjIyNyAxLjMyMyAyLjIyNyAyLjkyOHYuMDIyYzAgMS42MDUgMS4wMDUgMi45MDEgMi4yMzcgMi45MDFoMTQuNzUyYzEuMjMyIDAgMi4yMzctMS4zMDggMi4yMzctMi45MTN2LS4wMDd6IiBmaWxsPSIjRkFGQUZBIi8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K"
                />
            </div>
            <p className="ant-empty-description">暂无数据</p>
        </div>
    </li>
)

export type SelectProps<ValueType extends DefaultValueType = DefaultValueType> = InnerSelectProps<
    SelectOptionsType,
    ValueType
>

class RcPopSelect<VT extends DefaultValueType> extends React.Component<InnerSelectProps<SelectOptionsType, VT>> {
    render() {
        const {notFoundContent, ...rest} = this.props
        const newnotFoundContent = notFoundContent || EMPTY_ICON
        return <RefSelect notFoundContent={newnotFoundContent} {...rest} />
    }
}

export {Option, OptGroup}
export default RcPopSelect
