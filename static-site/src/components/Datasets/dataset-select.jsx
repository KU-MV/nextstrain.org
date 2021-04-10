import React from "react";
import PropTypes from 'prop-types';
import "react-select/dist/react-select.css";
import "react-virtualized-select/styles.css";
import { get, sortBy } from 'lodash';
import { FilterSelect } from "./filter-selection";
import { ListDatasets } from "./list-datasets";
import { FilterDisplay } from "./filter-display";
import { collectAvailableFilteringOptions, computeFilterValues } from "./filter-helpers";

/**
 * <DatasetSelect> is intended to render datasets [0] and expose a filtering UI to dynamically
 * restrict the visible datasets.
 *
 * PROPS:
 * @prop {string | undefined} urlDefinedFilterPath slash-separated keywords which will be applied as filters
 * @prop {string | undefined} intendedUri Intended URI. Browser address will be replaced with this.
 * @prop {Array} datasets Available datasets. Array of Objects.
 * @prop {boolean} noDates Note: will be replaced in a subsequent commit
 * @prop {Array | undefined} interface What elements to render? Elements may be strings or functinos. Order is respected.
 *       Available strings: "FilterSelect" "FilterDisplay", "ListDatasets"
 *       Functions will be handed an object with key(s): `datasets` (which may be filtered), and should return a react component for rendering.
 *       Default: ["FilterSelect", "FilterDisplay", "ListDatasets"]
 *
 * @returns React Component
 *
 * [0] Currently only datasets are rendered, but in the future narratives and other assets
 *     may be displayed
 */
class DatasetSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {},
    };
    this.applyFilter = (mode, trait, values) => {
      const availableFilterValues = collectAvailableFilteringOptions(this.props.datasets).map((o) => o.value);
      const filters = computeFilterValues(this.state.filters, availableFilterValues, mode, trait, values);
      if (filters) this.setState({filters});
    };
    this.getFilteredDatasets = this.getFilteredDatasets.bind(this);
  }

  componentDidMount() {
    if (this.props.urlDefinedFilterPath) {
      const filterValues = this.props.urlDefinedFilterPath
        .split("/")           // how keywords are separated in the URL
        .filter((x) => !!x);  // remove any empty strings
      this.applyFilter("add", "keyword", filterValues);
    }
    if (this.props.intendedUri) {
      // switch the pathname to the intended URI of the page, thus removing any extraneous
      // pathname fields (which are used to set filters but should not remain in the URL)
      window.history.replaceState({}, "", this.props.intendedUri);
    }
  }

  buildMatchesFilter(build, filterName, filterObjects) {
    const keywordArray = get(build, "filename").replace('.json', '').split("_");
    return filterObjects.every((filter) => {
      if (!filter.active) return true; // inactive filter is the same as a match
      return keywordArray.includes(filter.value);
    });
  }

  getFilteredDatasets() {
    // TODO this doesn't care about categories
    const filtered = this.props.datasets
      .filter((b) => b.url !== undefined)
      .filter((b) => Object.entries(this.state.filters)
        .filter((filterEntry) => filterEntry[1].length)
        .every(([filterName, filterValues]) => this.buildMatchesFilter(b, filterName, filterValues)));
    return sortBy(filtered, [(d) => d.filename.toLowerCase()]);
  }

  render() {
    const childrenToRender = this.props.interface || ["FilterSelect", "FilterDisplay", "ListDatasets"];
    const filteredDatasets = this.getFilteredDatasets();
    return (
      <>
        {childrenToRender.map((Child) => {
          switch (Child) {
            case "FilterSelect":
              return (
                <FilterSelect
                  key={String(Object.keys(this.state.filters).length)}
                  datasets={this.props.datasets}
                  applyFilter={this.applyFilter}
                />
              );
            case "FilterDisplay":
              return (
                <FilterDisplay
                  key="FilterDisplay"
                  filters={this.state.filters}
                  applyFilter={this.applyFilter}
                />
              );
            case "ListDatasets":
              return (
                <ListDatasets
                  key="ListDatasets"
                  datasets={filteredDatasets}
                  showDates={!this.props.noDates}
                />
              );
            default:
              if (typeof Child === "function") {
                return (
                  <Child
                    key={Child.name}
                    datasets={filteredDatasets}
                  />
                );
              }
              console.error("Unknown interface element passed to DatasetSelect");
              return null;
          }
        })}
      </>
    );
  }
}

DatasetSelect.propTypes = {
  urlDefinedFilterPath: PropTypes.string,
  intendedUri: PropTypes.string,
  interface: PropTypes.array,
  noDates: PropTypes.bool,
  datasets: PropTypes.array.isRequired
};

export default DatasetSelect;
