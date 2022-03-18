import { Request, Response } from "express";
import axios, { AxiosError, AxiosResponse } from 'axios'
import { URLSearchParams } from 'url';
import { debug } from "console";
import { kill } from "process";

const authorizeAccess = (req: Request, res: Response) =>
{
  const { code, state } : { code: string, state: string } = req.query as any;
  debug('code, state', {code, state})


  if(code.length && state.length && state === process.env.SPOTIFY_ACCESS_STATE)
  {
    debug('(code.length && state.length) === true')
    res.redirect(`/get-access?code=${encodeURIComponent(code)}`)
    return;
  }

  res.redirect('/get-access')
}

const getAccess = async (req: Request, res: Response) =>
{
  let refresh_token: string = req.cookies.refresh_token;
  let spotify_access_code: string = req.cookies.spotify_access_code;
  let userId: string = req.cookies.spotify_user_id;
  let userCountry: string = req.cookies.spotify_user_country;
  let accessToken: string = ''

  debug('getAccess cookies', {refresh_token, spotify_access_code, userId, userCountry, accessToken})
  if(req.query?.code.length && !spotify_access_code)
  {
    spotify_access_code = req.query.code as string;
    res.cookie('spotify_access_code', spotify_access_code, { maxAge: 365 * 24 * 60 * 60 * 1000 }) // one year 😂

    const getTokenResponse = await getAccessToken('authorization_code', spotify_access_code);

    if(getTokenResponse.status === 200)
    {
      refresh_token = getTokenResponse.data.refresh_token
      accessToken = getTokenResponse.data.access_token
      res.cookie('spotify_refresh_token', refresh_token)
    }

    const getUserResponse: AxiosResponse = await axios.get('https://api.spotify.com/v1/me',
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    .then((response: AxiosResponse) => response)
    .catch((error: AxiosError) =>
    {
      debug(error)
      return error.response
    })

    userId = getUserResponse.data.id
    userCountry = getUserResponse.data.country
  }

  res.cookie('spotify_user_id', userId)
  res.cookie('spotify_user_country', userCountry)
  res.status(200).redirect('http://localhost:3000/detoxed-release-radar')
}

const refreshAccess = async (req: Request) =>
{
  let accessToken: string = ''
  let expiresIn: string = ''

  const response = await getAccessToken('refresh_token', '', req.cookies.spotify_refresh_token);

  if(response.status === 200){
    accessToken = response.data.access_token
    expiresIn = response.data.expires_in
  }

  return { accessToken, expiresIn }
}

const getAccessToken = async (grantType: string, spotifyAccessCode: string = "", spotifyRefreshToken?: string) =>
{
  const clientId: string = process.env.SPOTIFY_APP_CLIENT_ID
  const clientSecret: string = process.env.SPOTIFY_APP_CLIENT_SECRET

  const formParams: URLSearchParams = new URLSearchParams()
  formParams.append('grant_type', grantType)

  if(spotifyAccessCode.length)
  {
    const APP_URL: string = process.env.APP_URL
    const AUTHORIZE_ACCESS_ENDPOINT: string = process.env.AUTHORIZE_ACCESS_ENDPOINT

    formParams.append('code', spotifyAccessCode)
    formParams.append('redirect_uri', `${APP_URL}${AUTHORIZE_ACCESS_ENDPOINT}`)
  }

  if(grantType === 'refresh_token')
  {
    formParams.append('refresh_token', spotifyRefreshToken )
  }

  const token: string = Buffer.from(`${clientId}:${clientSecret}`, 'utf-8').toString('base64')

  const apiTokenResponse: AxiosResponse = await axios.post('https://accounts.spotify.com/api/token', formParams,
  {
    headers:
    {
      'Authorization': `Basic ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then((response: AxiosResponse) => response)
  .catch((error: AxiosError) =>
  {
    debug(error)
    return error.response
  })

  return apiTokenResponse;
}

export {
  authorizeAccess,
  getAccess,
  refreshAccess
}