import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Table, TableHeader, TableBody, TableRow, TableHeaderColumn, TableRowColumn, TableFooter, FlatButton } from 'material-ui';

import { fetchUsersIfNeeded } from '../actions/UserActions';

class Users extends Component {

    componentWillMount() {
        const { dispatch } = this.props;

        dispatch(fetchUsersIfNeeded());
    }

    onRowClick(user) {
        const { onUserClick } = this.props;
        console.log('User row clicked', user, onUserClick);
        if (onUserClick) {
            onUserClick(user);
        }
    }

    onTableCellClick(row, col) {
        // Workaround for https://github.com/callemall/material-ui/issues/1783
        console.log('User table cell clicked', row, col);
        this.onRowClick(this.props.users.data[row]);
    }

    onCreate() {
        const { onUserClick } = this.props;
        console.log('onCreate');
        if (onUserClick) {
            onUserClick(null);
        }
    }

    render() {
        const { users } = this.props;
        console.log('render users -', users);

        return (
            <Table onCellClick={this.onTableCellClick.bind(this)}>
                <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                    <TableRow>
                        <TableHeaderColumn colSpan="3" style={{textAlign: 'center'}}>
                            Users
                        </TableHeaderColumn>
                    </TableRow>
                    <TableRow>
                        <TableHeaderColumn>Email</TableHeaderColumn>
                        <TableHeaderColumn>First Name</TableHeaderColumn>
                        <TableHeaderColumn>Last Name</TableHeaderColumn>
                    </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={false} showRowHover={true}>
                    {users.loading ?
                        <TableRow><TableRowColumn colSpan="3">Loading users...</TableRowColumn></TableRow> :
                        users.error ?
                            <TableRow><TableRowColumn
                                colSpan="3">Error: { users.error.message }</TableRowColumn></TableRow> :
                            users.data.map(user => (
                                <TableRow key={user.id} onRowClick={this.onRowClick.bind(this, user)}>
                                    <TableRowColumn>{ user.login }</TableRowColumn>
                                    <TableRowColumn>{ user.firstName }</TableRowColumn>
                                    <TableRowColumn>{ user.lastName }</TableRowColumn>
                                </TableRow>
                            ))
                    }
                </TableBody>
                <TableFooter adjustForCheckbox={false}>
                    <TableRow>
                        <TableRowColumn>
                            <FlatButton
                                label="Create a new user"
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

Users.propTypes = {
    onUserClick: PropTypes.func,
};

export default connect(state => ({
    users: state.users,
}))(Users);
