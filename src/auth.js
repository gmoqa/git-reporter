import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import GitLab from 'next-auth/providers/gitlab'
import Bitbucket from 'next-auth/providers/bitbucket'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
    }),
    GitLab({
      clientId: process.env.GITLAB_CLIENT_ID,
      clientSecret: process.env.GITLAB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'read_user read_api read_repository',
        },
      },
    }),
    Bitbucket({
      clientId: process.env.BITBUCKET_CLIENT_ID,
      clientSecret: process.env.BITBUCKET_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'account repository',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and provider to the token
      if (account) {
        token.accessToken = account.access_token
        token.provider = account.provider
        token.providerAccountId = account.providerAccountId
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken
      session.provider = token.provider
      session.providerAccountId = token.providerAccountId
      return session
    },
  },
  pages: {
    signIn: '/', // Redirect to home page for sign in
  },
})
