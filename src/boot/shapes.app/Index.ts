import * as Input from './Input'
import * as Rectangle from './Rectangle'
import * as Button from './Button'
import * as Checkbox from './Checkbox'
import * as FunctionBlock from './FunctionBlock'
import * as Group from './Group'
import * as Link from './Link'
import * as Select from './Select'
import * as Slider from './Slider'
import * as Table from './Table'
import * as TextBlock from './TextBlock'

export const shapes = {
  app: {
    ...Input,
    ...Rectangle,
    ...Button,
    ...Checkbox,
    ...FunctionBlock,
    ...Group,
    ...Link,
    ...Select,
    ...Slider,
    ...Table,
    ...TextBlock
  }
}
