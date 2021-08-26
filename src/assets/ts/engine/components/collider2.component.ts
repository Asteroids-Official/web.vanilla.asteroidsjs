import { hasCollider } from '../utils/validations'

import { Component } from '../core/component'
import { ICollider2 } from '../interfaces/collider2.interface'
import { Collision2 } from '../interfaces/collision2.interface'
import { ILoop } from '../interfaces/loop.interface'
import { IStart } from '../interfaces/start.interface'
import { Vector2 } from '../math/vector2'
import { Rigidbody } from './rigidbody.component'
import { Transform } from './transform.component'

/**
 * Class that represents a component that deals with collisions with
 * different entities
 *
 * A collider only interacts with entities that have the {@link Rigidbody}
 * component in order to make this behaviour more performatic
 */
export class Collider2 extends Component implements IStart, ILoop {
  /**
   * Property that represents the parent entity as {@link ICollider2}
   */
  private collider: ICollider2

  /**
   * Property that defines an instance of the {@link Rigidbody} component
   */
  private rigidbody: Rigidbody

  /**
   * Property that defines an instance of the {@link Transform} component
   */
  private transform: Transform

  /**
   * Property that defines an array with all the entity collisions with
   * others rigidbodies
   */
  private collisions: Collision2[] = []

  public start(): void {
    this.requires([Transform, Rigidbody])

    if (!hasCollider(this.entity)) {
      throw new Error(
        `${this.entity.constructor.name} has a ${this.constructor.name} but not implements the ICollider2 interface`,
      )
    }

    this.collider = this.entity
    this.rigidbody = this.getComponent(Rigidbody)
    this.transform = this.getComponent(Transform)
  }

  public loop(): void {
    this.normalizeCollisions()

    const rigidbodies = this.findAllRigidbodies()
    const transforms = rigidbodies.map((rigidbody) =>
      rigidbody.getComponent(Transform),
    )

    for (let i = 0; i < transforms.length; i++) {
      const transform = transforms[i]

      if (
        Vector2.distance(this.transform.position, transform.position) >
        (this.transform.dimensions.width + transform.dimensions.width) / 2
      ) {
        continue
      }

      let collision = this.collisions.find(
        (collision) =>
          collision.rigidbody1 === this.rigidbody &&
          collision.rigidbody2 === rigidbodies[i],
      )

      if (!collision) {
        // TODO: Add the collision points
        collision = {
          rigidbody1: this.rigidbody,
          rigidbody2: rigidbodies[i],
        }
        this.collisions.push(collision)
        this.collider.startCollide(collision)
      } else {
        this.collider.stayCollide(collision)
      }
    }
  }

  /**
   * Method that removes all the collisions that are not colliding anymore
   */
  private normalizeCollisions(): void {
    for (let i = 0; i < this.collisions.length; i++) {
      const collision = this.collisions[i]

      const transform1 = collision.rigidbody1.getComponent(Transform)
      const transform2 = collision.rigidbody2.getComponent(Transform)

      if (
        Vector2.distance(transform1.position, transform2.position) <
        (transform1.dimensions.width + transform2.dimensions.width) / 2
      ) {
        continue
      }

      this.collisions = this.collisions.filter((_, index) => index !== i)
      this.collider.endCollide(collision)
    }
  }

  /**
   * Method that finds all the rigidbodies instanced in the game
   *
   * @returns an array with all the found rigidbodies
   */
  private findAllRigidbodies(): Rigidbody[] {
    return this.game.entities
      .filter((entity) => entity != this.entity)
      .map((entity) => entity.getComponent(Rigidbody))
  }
}
