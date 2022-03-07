import { Request, Response, Router } from "express";
import axios, { AxiosError, AxiosResponse } from 'axios'
import { URLSearchParams } from 'url';

const authorizeAccess = (req: Request, res: Response) =>
{
  const { code, state } : { code: string, state: string } = req.query as any;


  if(code.length && state.length && state === process.env.SPOTIFY_ACCESS_STATE)
  {
    res.redirect(`/get-access?code=${encodeURIComponent(code)}`)
    return;
  }

  res.redirect('/get-access')
}

const getAccess = async (req: Request, res: Response) =>
{
  let refresh_token: string = req.cookies.refresh_token;
  let spotify_access_code: string = req.cookies.spotify_access_code;
  let user_id: string = req.cookies.spotify_user_id;
  let user_country: string = req.cookies.spotify_user_country;
  let accessToken: string = ''


  if(req.query?.code.length && !spotify_access_code)
  {
    spotify_access_code = req.query.code as string;
    res.cookie('spotify_access_code', spotify_access_code, { maxAge: 365 * 24 * 60 * 60 * 1000 }) // one year 😂

    const getAccessTokenResponse = await getAccessToken('authorization_code', spotify_access_code);

    if(getAccessTokenResponse.status === 200)
    {
      refresh_token = getAccessTokenResponse.data.refresh_token
      accessToken = getAccessTokenResponse.data.access_token
      res.cookie('spotify_refresh_token', refresh_token)
    }

    const getUserResponse: AxiosResponse = await axios.get('https://api.spotify.com/v1/me',
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    .then((response: AxiosResponse) => response)
    .catch((error: AxiosError) =>
    {
      // tslint:disable-next-line:no-console
      console.error(error)
      return error.response
    })

    user_id = getUserResponse.data.id
    user_country = getUserResponse.data.country
  }

  res.cookie('spotify_user_id', user_id)
  res.cookie('spotify_user_country', user_country)
  res.status(200).redirect('http://localhost:3000/detoxed-release-radar')
}

const refreshAccess = (req: Request, res: Response) =>
{
  res.send('refresh access')
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
    // tslint:disable-next-line:no-console
    console.error(error)
    return error.response
  })

  return apiTokenResponse;
}

export {
  authorizeAccess,
  getAccess,
  refreshAccess
}