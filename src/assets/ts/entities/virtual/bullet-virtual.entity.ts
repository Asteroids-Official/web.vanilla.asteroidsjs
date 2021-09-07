import {
  AbstractEntity,
  Entity,
  IDraw,
  IOnAwake,
  IOnLoop,
  IOnStart,
  Vector2,
} from '@asteroidsjs'

import { socket } from '../../socket'

import { Drawer } from '../../components/drawer.component'
import { Render } from '../../components/renderers/render.component'
import { Rigidbody } from '../../components/rigidbody.component'
import { Transform } from '../../components/transform.component'

import { IBullet } from '../../interfaces/bullet.interface'

@Entity({
  components: [
    Drawer,
    Render,
    {
      id: '__bullet_virtual_transform__',
      class: Transform,
    },
    {
      id: '__bullet_virtual_rigidbody__',
      class: Rigidbody,
    },
  ],
})
export class BulletVirtual
  extends AbstractEntity
  implements IBullet, IDraw, IOnAwake, IOnLoop, IOnStart
{
  public transform: Transform
  public rigidbody: Rigidbody

  public get direction(): Vector2 {
    return new Vector2(
      Math.sin(this.transform.rotation),
      Math.cos(this.transform.rotation),
    )
  }

  onAwake(): void {
    this.transform = this.getComponent(Transform)
    this.rigidbody = this.getComponent(Rigidbody)
  }

  onStart(): void {
    socket.on('destroy', (id: string) => {
      if (id === this.id) {
        this.destroy(this)
      }
    })
  }

  draw(): void {
    this.getContext().translate(
      this.transform.canvasPosition.x,
      this.transform.canvasPosition.y,
    )
    this.getContext().rotate(this.transform.rotation)

    this.getContext().shadowColor = 'yellow'
    this.getContext().shadowBlur = 25

    this.getContext().beginPath()
    this.getContext().fillStyle = '#ffc887'
    this.getContext().rect(
      0,
      0,
      this.transform.dimensions.width,
      this.transform.dimensions.height,
    )
    this.getContext().fill()
    this.getContext().closePath()

    this.getContext().shadowColor = 'transparent'
    this.getContext().shadowBlur = 0

    this.getContext().rotate(-this.transform.rotation)
    this.getContext().translate(
      -this.transform.canvasPosition.x,
      -this.transform.canvasPosition.y,
    )
  }

  onLoop(): void {
    const hasOverflowX =
      this.transform.canvasPosition.x + this.transform.dimensions.width + 50 <
        0 ||
      this.transform.canvasPosition.x - this.transform.dimensions.width - 50 >
        this.getContext().canvas.width
    const hasOverflowY =
      this.transform.canvasPosition.y + this.transform.dimensions.height + 50 <
        0 ||
      this.transform.canvasPosition.y - this.transform.dimensions.height - 50 >
        this.getContext().canvas.height

    if (hasOverflowX || hasOverflowY) {
      this.destroy(this)
    }
  }
}