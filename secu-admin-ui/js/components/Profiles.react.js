import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Table, TableHeader, TableBody, TableRow, TableHeaderColumn, TableRowColumn, TableFooter, FlatButton } from 'material-ui';

import { fetchProfilesIfNeeded } from '../actions/ProfileActions';

class Profiles extends Component {

    componentWillMount() {
        const { dispatch } = this.props;
        dispatch(fetchProfilesIfNeeded());
    }

    onRowClick(profile) {
        const { onProfileClick } = this.props;
        console.log('Profile row clicked', profile, onProfileClick);
        if (onProfileClick) {
            onProfileClick(profile);
        }
    }

    onTableCellClick(row, col) {
        // Workaround for https://github.com/callemall/material-ui/issues/1783
        console.log('Profile table cell clicked', row, col);
        this.onRowClick(this.props.profiles.data[row]);
    }

    onCreate() {
        const { onProfileClick } = this.props;
        console.log('onCreate');
        if (onProfileClick) {
            onProfileClick(null);
        }
    }

    render() {
        const { profiles } = this.props;

        return (
            <Table onCellClick={this.onTableCellClick.bind(this)}>
                <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                    <TableRow>
                        <TableHeaderColumn style={{textAlign: 'center'}}>
                            Profiles
                        </TableHeaderColumn>
                    </TableRow>
                    <TableRow>
                        <TableHeaderColumn>Description</TableHeaderColumn>
                    </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={false} showRowHover={true}>
                    {profiles.error ?
                        <TableRow><TableRowColumn colSpan="3">Error: { profiles.error.message }</TableRowColumn></TableRow> :
                        profiles.data.map(profile => (
                            <TableRow key={profile.id} onRowClick={this.onRowClick.bind(this, profile)}>
                                <TableRowColumn>
                                    <div>{ profile.description }</div>
                                </TableRowColumn>
                            </TableRow>
                        ), this)
                    }
                    {profiles.loading ? <TableRow><TableRowColumn>Loading profiles...</TableRowColumn></TableRow> : null}
                </TableBody>
                <TableFooter adjustForCheckbox={false}>
                    <TableRow>
                        <TableRowColumn>
                            <FlatButton
                                label="Create a new profile"
                                secondary={true}
                                onTouchTap={this.onCreate.bind(this)}
                                />
                        </TableRowColumn>
                    </TableRow>
                </TableFooter>
            </Table>
        );
    }

}

Profiles.propTypes = {
    onProfileClick: PropTypes.func,
};

export default connect(state => ({
    profiles: state.profiles,
}))(Profiles);
