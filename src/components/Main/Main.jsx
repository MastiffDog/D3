import React from 'react';
import HeaderComponent from '../Header/HeaderComponent';
import FiltersComponent from '../FiltersComponent/FiltersComponent';
import { montages, years } from '../../mockData/mockData';

class ExportPdfComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showFiltersDialog: false,
      montages: [],
      years: [],
      initialY: 50
    }
  }

  toggleFilters = () => {
    this.setState({ showFiltersDialog: !this.state.showFiltersDialog });
  }

  submitFilters = (data) => {
    this.toggleFilters();
    this.setState({
      years: data.years,
      montages: data.montages,
      initialY: 50
    })
  }

  //this is for the future service of getiing data from the backend
  componentDidMount() {
    this.setState({ years: years, montages: montages })
  }

  render() {
    return (
      <div>
        <HeaderComponent
          showFilters={this.toggleFilters}
          montages={this.state.montages}
          years={this.state.years}
          initialY={this.state.initialY}
        />

        <FiltersComponent
          isVisible={this.state.showFiltersDialog}
          submitFilters={this.submitFilters}
        />
      </div>
    );
  }
}

export default ExportPdfComponent;