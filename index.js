document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000/tickets';
    const ticketForm = document.getElementById('ticket-form');
    const ticketTableBody = document.getElementById('ticket-table-body');
    let editMode = false;
    let editId = null;
  
    const fetchTickets = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        displayTickets(data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    };
  
    const displayTickets = (tickets) => {
      ticketTableBody.innerHTML = '';
      tickets.forEach(ticket => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${ticket.title}</td>
          <td>${ticket.description}</td>
          <td>${ticket.status}</td>
          <td>${new Date(ticket.dueDate).toLocaleString()}</td>
          <td>${getPriority(ticket.dueDate)}</td>
          <td>
            <button class="edit" data-id="${ticket.id}">Edit</button>
            <button class="delete" data-id="${ticket.id}">Delete</button>
          </td>
        `;
        ticketTableBody.appendChild(tr);
      });
    };
  
    const getPriority = (dueDate) => {
      const now = new Date();
      const due = new Date(dueDate);
      const timeDiff = due - now;
      if (timeDiff < 0) return 'Overdue';
      if (timeDiff < 86400000) return 'High'; // less than 1 day
      if (timeDiff < 604800000) return 'Medium'; // less than 1 week
      return 'Low';
    };
  
    const addOrUpdateTicket = async (e) => {
      e.preventDefault();
      const title = document.getElementById('title').value;
      const description = document.getElementById('description').value;
      const status = document.getElementById('status').value;
      const dueDate = document.getElementById('dueDate').value;
  
      const ticket = { title, description, status, dueDate };
  
      try {
        let response;
        if (editMode) {
          response = await fetch(`${API_URL}/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticket)
          });
          editMode = false;
          editId = null;
        } else {
          response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticket)
          });
        }
        if (!response.ok) throw new Error('Network response was not ok');
        fetchTickets();
        ticketForm.reset();
      } catch (error) {
        console.error('Error saving ticket:', error);
      }
    };
  
    const deleteTicket = async (id) => {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Network response was not ok');
        fetchTickets();
      } catch (error) {
        console.error('Error deleting ticket:', error);
      }
    };
  
    const editTicket = (id, ticket) => {
      document.getElementById('title').value = ticket.title;
      document.getElementById('description').value = ticket.description;
      document.getElementById('status').value = ticket.status;
      document.getElementById('dueDate').value = ticket.dueDate;
      editMode = true;
      editId = id;
    };
  
    ticketTableBody.addEventListener('click', (e) => {
      if (e.target.classList.contains('edit')) {
        const id = e.target.dataset.id;
        const ticket = Array.from(ticketTableBody.children).find(tr => tr.querySelector('.edit').dataset.id == id).children;
        editTicket(id, {
          title: ticket[0].innerText,
          description: ticket[1].innerText,
          status: ticket[2].innerText,
          dueDate: new Date(ticket[3].innerText).toISOString().slice(0, 16)
        });
      }
      if (e.target.classList.contains('delete')) {
        const id = e.target.dataset.id;
        deleteTicket(id);
      }
    });
  
    ticketForm.addEventListener('submit', addOrUpdateTicket);
  
    fetchTickets();
  });
  