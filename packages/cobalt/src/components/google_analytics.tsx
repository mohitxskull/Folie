import Script from 'next/script.js'

type Props = {
  gtag: string
}

/**
 * Renders the Google Analytics script.
 * Use it in the `pages/_app.tsx` file inside the `Head` component.
 */
const GoogleAnalytics = (props: Props) => (
  <>
    <Script
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${props.gtag}`}
    />

    <Script id="google-analytics" strategy="afterInteractive">
      {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${props.gtag}');
        `}
    </Script>
  </>
)

export default GoogleAnalytics
