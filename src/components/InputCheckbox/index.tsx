import classNames from "classnames"
import { useRef } from "react"
import { InputCheckboxComponent } from "./types"

export const InputCheckbox: InputCheckboxComponent = ({ id, checked, onChange }) => {
  const { current: inputId } = useRef(`RampInputCheckbox-${id}`)

  const updateCheckbox = () => {
    onChange(!checked)
    checked = !checked
  }

  return (
    <div className="RampInputCheckbox--container" data-testid={inputId} onClick={updateCheckbox}>
      <label
        className={classNames("RampInputCheckbox--label", {
          "RampInputCheckbox--label-checked": checked,
        })}
      />
      <input
        id={inputId}
        type="checkbox"
        className="RampInputCheckbox--input"
        checked={checked}
        onChange={updateCheckbox}
      />
    </div>
  )
}
