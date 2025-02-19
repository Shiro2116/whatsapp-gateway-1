import { JWTTokenContract } from '@ioc:Adonis/Addons/Jwt'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import LoginValidator from 'App/Validators/Auth/LoginValidator'
import RefreshTokenValidator from 'App/Validators/Auth/RefreshTokenValidator'

export default class AuthController {
  /**
   * Logged in user
   *
   * @param param0 HTTPContextContract
   * @returns
   */
  public async login({ request, auth, response }: HttpContextContract) {
    const { email, password } = await request.validate(LoginValidator)

    try {
      const token = await auth.use('jwt').attempt(email, password)
      return response.created(this._formatToken(token))
    } catch {
      return response.unauthorized({
        message: 'Email/password wrong',
      })
    }
  }

  /**
   * Refresh Access Token
   * Run automatic when token expired from frontend
   *
   * @param param0 HTTPContextContract
   * @returns
   */
  public async refreshToken({ request, auth, response }: HttpContextContract) {
    const { refreshToken } = await request.validate(RefreshTokenValidator)

    try {
      const token = await auth.use('jwt').loginViaRefreshToken(refreshToken)
      return response.created(this._formatToken(token))
    } catch {
      return response.unauthorized({
        message: 'Invalid refresh token',
      })
    }
  }

  /**
   * Format token
   *
   * @param token JWTTokenContract<User>
   * @returns object
   */
  private _formatToken(token: JWTTokenContract<User>): object {
    return {
      type: token.type,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      expires_at: token.expiresAt,
    }
  }
}
