import React from 'react';
import styles from './HeaderComponent.module.css';
import ContentDataComponent from '../ContentDataComponent/ContentDataComponent';
import ReactToPrint from 'react-to-print';
class HeaderComponent extends React.Component {

  render() {
    return (
      <>
        <div className={styles['navigation-panel']}>
          <div className={styles['filters']} onClick={() => this.props.showFilters()}>
            <span>Filters</span>
          </div>
          <ReactToPrint
            content={() => this.componentRef}
            trigger={() => <div className={styles['print']} >
              <span>Print to PDF</span>
            </div>
            }
          />
        </div>

        <ContentDataComponent
          ref={(response) => (this.componentRef = response)}
          montages={this.props.montages}
          years={this.props.years}
          initialY={this.props.initialY}
        />
      </>
    );
  }
}

export default HeaderComponent;