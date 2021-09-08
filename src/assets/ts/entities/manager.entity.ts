import {
  AbstractEntity,
  Entity,
  IOnStart,
  ISocketData,
  Rect,
  Vector2,
} from '@asteroidsjs'

import { socket } from '../socket'

import { Asteroid } from './master/asteroid.entity'
import { Bullet } from './master/bullet.entity'
import { ManagerAsteroids } from './master/manager-asteroids.entity'
import { Score } from './master/score.entity'
import { Spaceship } from './master/spaceship.entity'
import { AsteroidVirtual } from './virtual/asteroid-virtual.entity'
import { BulletVirtual } from './virtual/bullet-virtual.entity'
import { SpaceshipVirtual } from './virtual/spaceship-virtual.entity'

import { Health } from '../components/health.component'

/**
 * Class that represents the first entity to be loaded into the game
 */
@Entity()
export class Manager extends AbstractEntity implements IOnStart {
  public onStart(): void {
    if (this.game.getScreen().number === 1) {
      setTimeout(() => {
        this.master()
      }, 100)
    } else {
      this.virtual()
    }
  }

  private master(): void {
    const color = window.localStorage.getItem('asteroidsjs_spaceship_color')
    let nickname = window.localStorage.getItem('asteroidsjs_nickname')
    nickname = nickname ? nickname.toUpperCase() : 'GUEST'

    let imageSrc = ''
    let spaceshipColor = ''

    if (color) {
      spaceshipColor = JSON.parse(color).rgb
      imageSrc = `./assets/svg/spaceship-${JSON.parse(color).name}.svg`
    } else {
      spaceshipColor = '#888888'
      imageSrc = './assets/svg/spaceship-grey.svg'
    }

    this.instantiate({
      entity: ManagerAsteroids,
    })

    this.instantiate({
      entity: Score,
    })

    const spaceship = this.instantiate({
      use: {
        spaceshipColor,
        nickname,
        imageSrc,
      },
      entity: Spaceship,
      components: [
        {
          id: '__spaceship_transform__',
          use: {
            rotation: 0,
            dimensions: new Rect(50, 50),
          },
        },
        {
          id: '__spaceship_rigidbody__',
          use: {
            friction: 0.03,
            mass: 10,
            maxVelocity: 8,
            maxAngularVelocity: 0.09,
          },
        },
        {
          class: Health,
          use: {
            color: spaceshipColor,
            maxHealth: 30,
            health: 30,
          },
        },
      ],
    })

    socket.emit('instantiate', {
      id: spaceship.id,
      type: Spaceship.name,
      data: {
        position: new Vector2(),
        dimensions: new Rect(50, 50),
        spaceshipColor,
        nickname,
        imageSrc,
        maxHealth: 30,
        health: 30,
      },
    } as ISocketData)
  }

  private virtual(): void {
    socket.on('instantiate', ({ id, type, data }: ISocketData) => {
      switch (type) {
        case Spaceship.name:
          this.instantiate({
            use: {
              id,
              spaceshipColor: data.spaceshipColor,
              nickname: data.nickname,
              imageSrc: data.imageSrc,
            },
            entity: SpaceshipVirtual,
            components: [
              {
                id: '__spaceship_virtual_transform__',
                use: {
                  rotation: data.rotation,
                  position: data.position,
                  dimensions: data.dimensions,
                },
              },
              {
                class: Health,
                use: {
                  color: data.spaceshipColor,
                  maxHealth: data.maxHealth,
                  health: data.health,
                },
              },
            ],
          })
          break
        case Bullet.name:
          this.instantiate({
            use: {
              id,
            },
            entity: BulletVirtual,
            components: [
              {
                id: '__bullet_virtual_transform__',
                use: {
                  rotation: data.rotation,
                  position: data.position,
                  dimensions: new Rect(2, 14),
                },
              },
              {
                id: '__bullet_virtual_rigidbody__',
                use: {
                  velocity: data.velocity,
                  mass: 3,
                },
              },
            ],
          })
          break
        case Asteroid.name:
          this.instantiate({
            use: {
              id,
              asteroidSize: data.asteroidSize,
              image: data.image,
            },
            entity: AsteroidVirtual,
            components: [
              {
                id: '__asteroid_virtual_transform__',
                use: {
                  rotation: data.rotation,
                  position: data.position,
                },
              },
              {
                id: '__asteroid_virtual_rigidbody__',
                use: {
                  velocity: data.velocity,
                  mass: data.mass,
                  maxAngularVelocity: data.maxAngularVelocity,
                  angularVelocity: data.angularVelocity,
                },
              },
            ],
          })
          break
      }
    })
  }
}
