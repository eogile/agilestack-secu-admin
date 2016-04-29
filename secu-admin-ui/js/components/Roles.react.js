import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Table, TableHeader, TableBody, TableRow, TableHeaderColumn, TableRowColumn } from 'material-ui';

import { fetchRolesIfNeeded } from '../actions/RoleActions';

class Roles extends Component {

    componentWillMount() {
        const { dispatch } = this.props;
        dispatch(fetchRolesIfNeeded());
    }

    render() {
        const { roles } = this.props;

        return (
            <Table>
                <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                    <TableRow>
                        <TableHeaderColumn style={{textAlign: 'center'}}>
                            Roles
                        </TableHeaderColumn>
                    </TableRow>
                    <TableRow>
                        <TableHeaderColumn>Description</TableHeaderColumn>
                    </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={false} showRowHover={true}>
                    {roles.loading ?
                        <TableRow><TableRowColumn>Loading roles...</TableRowColumn></TableRow> :
                        roles.error ?
                            <TableRow><TableRowColumn
                                colSpan="3">Error: { roles.error.message }</TableRowColumn></TableRow> :
                            roles.data.map(role => (
                                <TableRow key={role.id}>
                                    <TableRowColumn>{ role.description }</TableRowColumn>
                                </TableRow>
                            ))
                    }
                </TableBody>
            </Table>
        );
    }

}

export default connect(state => ({
    roles: state.roles,
}))(Roles);
