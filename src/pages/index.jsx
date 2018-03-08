import React from "react"
import Helmet from "react-helmet"
import styled from "styled-components"
import SEO from "../components/SEO/SEO"
import config from "../../data/SiteConfig"
import Navigation from '../components/Header'
import Splash from "../components/Splash";


/* removed:
<IndexHeadContainer>
  <Navigation />
  <Hero>
    <h1>{config.siteTitle}</h1>
    <h4>{config.siteDescription}</h4>
  </Hero>
</IndexHeadContainer>


<CtaButton to={'/lesson-one'}>See Your First Post</CtaButton>

*/

class Index extends React.Component {

  render() {
    const postEdges = this.props.data.allMarkdownRemark.edges;
    return (
      <div className="index-container">
        <Helmet title={config.siteTitle} />
        <SEO postEdges={postEdges} />
        <main>
          <Navigation location={this.props.location} />
          <Splash />
        </main>
      </div>
    );
  }
}

export default Index;

// const IndexHeadContainer = styled.div`
//   background: ${props => props.theme.brand};
//   padding: ${props => props.theme.sitePadding};
//   text-align: center;
// `
//
// const Hero = styled.div`
//   padding: 50px 0;
//   & > h1 {
//     font-weight: 600;
//   }
// `
//
// const BodyContainer = styled.div`
//   padding: ${props => props.theme.sitePadding};
//   max-width: ${props => props.theme.contentWidthLaptop};
//   margin: 0 auto;
// `

/* eslint no-undef: "off" */
export const pageQuery = graphql`
  query IndexQuery {
    allMarkdownRemark(
      limit: 2000
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      edges {
        node {
          fields {
            slug
          }
          excerpt
          timeToRead
          frontmatter {
            title
            date
          }
        }
      }
    }
  }
`;
