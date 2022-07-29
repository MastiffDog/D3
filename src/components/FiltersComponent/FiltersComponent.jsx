import React from 'react';
import styles from './FiltersComponent.module.css';
import { years, montages } from '../../mockData/mockData';

class FiltersComponent extends React.Component {
    result = {
        montages: [],
        years: []
    }

    montagesStatus = {
        done: false,
        in_progress: false,
        not_started: false
    }

    componentDidUpdate() {
        //TO DO. Here should be a service to get all data 
        this.result = {
            montages: montages,
            years: years
        }
    }

    setMontageType = (type) => {
        if (type === "not_started") {
            this.montagesStatus.not_started = !this.montagesStatus.not_started;
        }
        if (type === "in_progress") {
            this.montagesStatus.in_progress = !this.montagesStatus.in_progress;
        }
        if (type === "done") {
            this.montagesStatus.done = !this.montagesStatus.done;
        }
    }

    //return true if array "groups" (montage part) satisfies a condition
    checkMontageByType = (type, groups) => {
        if (type === "done" && groups.length) {
            let result = true;
            groups.forEach(item => {
                if (item.status !== "done") {
                    result = false;
                }
            })
            return result;
        }

        if (type === "not_started" && groups.length) {
            let result = true;
            groups.forEach(item => {
                if (item.status !== "not_started") {
                    result = false;
                }
            })
            return result;
        }

        if (type === "in_progress" && groups.length) {
            let doneStatusExists = false;
            let notStartedStatusExists = false;
            groups.forEach(item => {
                if (item.status === "done") {
                    doneStatusExists = true;
                }
                if (item.status === "not_started") {
                    notStartedStatusExists = true;
                }
            })
            if (doneStatusExists && notStartedStatusExists) return true;
            return false;
        }
    }

    submit = () => {
        //here we use just montages data - for simple logic of filtering data. If we want to sort data by Date, we should do it
        //server side by using database methods etc;
        let currentMontages = [];

        if (this.montagesStatus.in_progress) {
            this.result.montages.forEach(item => {
                if (this.checkMontageByType("in_progress", item.groups)) {
                    currentMontages.push(item);
                }
            })
        }
        if (this.montagesStatus.not_started) {
            this.result.montages.forEach(item => {
                if (this.checkMontageByType("not_started", item.groups)) {
                    currentMontages.push(item);
                }
            })
        }
        if (this.montagesStatus.done) {
            this.result.montages.forEach(item => {
                if (this.checkMontageByType("done", item.groups)) {
                    currentMontages.push(item);
                }
            })
        }

        const resultToSubmit = {
            years: this.result.years,
            montages: currentMontages
        }

        this.montagesStatus = {
            done: false,
            in_progress: false,
            not_started: false
        }

        this.props.submitFilters(resultToSubmit);
    }

    render() {
        return (
            <>
                {
                    this.props.isVisible ?
                        <div className={styles['filters-container']}>
                            <div className={styles['filters-menu']}>
                                <div className={styles['labels-container']}>
                                    <div className={styles['labels-item']}>
                                        <div className={styles['label-item-input']}>
                                            <input type="checkbox" onChange={() => { this.setMontageType("not_started") }} />
                                        </div>
                                        <div className={styles['labels-item-text']}>
                                            <span>
                                                Показать планируемые объекты
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles['labels-item']}>
                                        <div className={styles['label-item-input']}>
                                            <input type="checkbox" onChange={() => { this.setMontageType("in_progress") }} />
                                        </div>
                                        <div className={styles['labels-item-text']}>
                                            <span>
                                                Показать объекты в работе
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles['labels-item']}>
                                        <div className={styles['label-item-input']}>
                                            <input type="checkbox" onChange={() => { this.setMontageType("done") }} />
                                        </div>
                                        <div className={styles['labels-item-text']}>
                                            <span>
                                                Показать законченные объекты
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles['filters-submit']} onClick={() => this.submit()}>
                                    <span>Submit</span>
                                </div>
                            </div>
                        </div>
                        :
                        <></>
                }
            </>
        );
    }
}

export default FiltersComponent;