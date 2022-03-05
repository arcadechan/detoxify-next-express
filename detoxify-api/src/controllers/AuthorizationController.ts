import { Request, Response, Router } from "express";
import axios, { AxiosResponse } from 'axios'
import { URLSearchParams } from 'url';

const authorizeAccess = (req: Request, res: Response) =>
{
  const { code, state } : { code: string, state: string } = req.query as any;

  if(code && state && state === process.env.SPOTIFY_ACCESS_STATE)
  {
    res.redirect(`/get-access?code=${encodeURIComponent(code)}`)
  }

  res.redirect('/get-access')
}

const getAccess = async (req: Request, res: Response) =>
{
  const refresh_token: string = req.cookies.refresh_token;
  const spotify_access_code: string = req.cookies.spotify_access_code;
  const user_id: string = req.cookies.user_id;
  const user_country: string = req.cookies.user_country;

  if(req.query?.code && !spotify_access_code)
  {
    const code = req.query.code as string;
    res.cookie('spotify_refresh_token', code, { maxAge: 365 * 24 * 60 * 60 * 1000 }) // one year 😂
    const data: any = null;

    const response = await getAccessToken('authorization_code', code);
    // tslint:disable-next-line:no-console
    console.log('getAccess response', response)
  }
}

const refreshAccess = (req: Request, res: Response) =>
{
  res.send('refresh access')
}

const getAccessToken = async (grantType: string, spotifyAccessCode: string = "", spotifyRefreshToken?: string) =>
{
  const client_id: string = process.env.client_id
  const client_secret: string = process.env.client_secret

  let formParams = { grant_type: grantType }

  if(spotifyAccessCode.length)
  {
    const APP_URL: string = process.env.APP_URL
    const AUTHORIZE_ACCESS_ENDPOINT: string = process.env.AUTHORIZE_ACCESS_ENDPOINT

    formParams = Object.assign(formParams, { code: spotifyAccessCode })
    formParams = Object.assign(formParams, { redirect_uri: `${APP_URL}${AUTHORIZE_ACCESS_ENDPOINT}`})
  }

  if(grantType === 'refresh_token')
  {
    formParams = Object.assign(formParams, { refresh_token: spotifyRefreshToken })
  }

  const token: string = Buffer.from(`${client_id}:${client_secret}`, 'utf-8').toString('base64')
  const response = await axios.post('https://accounts.spotify.com/api/token',
  new URLSearchParams(formParams).toString(),
  {
    headers: {
      'Authorization': `Basic ${token}`,
      'Content-Type': 'x-www-form-urlencoded'
    }
  }).then((res: AxiosResponse) =>
  {
    // tslint:disable-next-line:no-console
    console.log('response', res)
  }).catch((error) =>
  {
    // tslint:disable-next-line:no-console
    console.error('error', error)
  })

  return response;
}

export {
  authorizeAccess,
  getAccess,
  refreshAccess
}