/** @format */

import * as React from 'react'
import {OptionData} from './index.interface'

export interface OptionProps extends Omit<OptionData, 'label'> {
    children: React.ReactNode
}

export interface OptionFC extends React.FC<OptionProps> {
    /** Legacy for check if is a Option Group */
    isSelectOption: boolean
}

/** This is a placeholder, not real render in dom */
const Option: OptionFC = () => null
Option.isSelectOption = true

export default Option
