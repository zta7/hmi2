import * as joint from '@clientio/rappid'

/**
 * 方案设计 连线（DesignLink）
 * 仅用于设计方案导出到 HMI2，使用 manhattan 正交路由（仅横纵走线，直角拐弯）。
 * 不影响 HMI2 原有 app.Link 组件。
 *
 * gojsToJoint 写入的 attrs 会覆盖默认样式：
 *   attrs.line.stroke / strokeWidth / stroke-dasharray
 */
export class DesignLink extends joint.dia.Link {
  defaults() {
    return joint.util.defaultsDeep({
      type: 'app.DesignLink',
      router: {
        name: 'manhattan',
        args: {
          step: 10,
          padding: 15,
          maximumLoops: 4,
          startDirections: ['top', 'bottom', 'left', 'right'],
          endDirections: ['top', 'bottom', 'left', 'right'],
        },
      },
      connector: {
        name: 'rounded',
        args: { radius: 4 },
      },
      attrs: {
        line: {
          stroke: '#22c55e',
          strokeWidth: 2,
          fill: 'none',
        },
      },
    }, joint.dia.Link.prototype.defaults)
  }
}
