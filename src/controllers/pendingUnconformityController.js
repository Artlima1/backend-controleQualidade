const PendingUnconformity = require("../models/PendingUnconformityModel");
const Users = require("../models/UserModel");

module.exports = {
  async createUnconformity(req, res) {
    try {
      let unconformity = req.body;
      unconformity.created_by = req.session.user.user_id;

      const responsable = await Users.read({user_id: unconformity.responsable});

      if (responsable.length===0){
        return res.status(400).json({message: "Responsable not found!"});
      }
      
      const response = await PendingUnconformity.create(unconformity);

      return res.status(200).json({response});
    } catch (error) {
      console.warn(error);
      return res.status(500).json({message: "Internal Server Error"});
    }
  },

  async getAllUnconformities(req, res) {
    try {
      const filters = req.query;

      const unconformities = await PendingUnconformity.read(filters);

      //Joining with users table, but storing responsable and user in keys insted of in the main object
      const response = await Promise.all(
        unconformities.map(async (unconformity) => {
          const created_by = await Users.read({
            user_id: unconformity.created_by,
          });
          const responsable = await Users.read({
            user_id: unconformity.responsable,
          });
          unconformity.created_by = created_by[0];
          unconformity.responsable = responsable[0];
          return unconformity;
        })
      );

      return res.status(200).json({response});
    } catch (error) {
      console.warn(error);
      return res.status(500).json({message: "Internal Server Error"});
    }
  },
  
  async getMyUnconformities(req, res) {
    try {
      let filters = req.query;
      filters.responsable = req.session.user.user_id;
      console.log("🚀 ~ file: pendingUnconformityController.js ~ line 51 ~ getMyUnconformities ~ req.session.user", req.session.user)
      
      const unconformities = await PendingUnconformity.read(filters);

      const response = await Promise.all(
        unconformities.map(async (unconformity) => {
          const created_by = await Users.read({
            user_id: unconformity.created_by,
          });
          const responsable = await Users.read({
            user_id: unconformity.responsable,
          });
          unconformity.created_by = created_by[0];
          unconformity.responsable = responsable[0];
          return unconformity;
        })
      );

      return res.status(200).json({response});
    } catch (error) {
      console.warn(error);
      return res.status(500).json({message: "Internal Server Error"});
    }
  },

  async updateUnconformity(req, res) {
    try {
      const newFields = req.body;
      const pending_unconformity_id = req.params.pending_unconformity_id;

      const response = await PendingUnconformity.update(
        pending_unconformity_id,
        newFields
      );

      if (response !== 1) {
        return res.status(400).json("Unconformity not found");
      } else {
        return res.status(200).json("Updated Successfully!");
      }
    } catch (error) {
      console.warn(error);
      return res.status(500).json({message: "Internal Server Error"});
    }
  },

  async deleteUnconformity(req, res) {
    try {
      const pending_unconformity_id = req.params.pending_unconformity_id;

      const response = await PendingUnconformity.delete(pending_unconformity_id);

      if (response !== 1) {
        return res.status(400).json("Unconformity not found");
      } else {
        return res.status(200).json("Deleted Successfully!");
      }
    } catch (error) {
      console.warn(error);
      return res.status(500).json({message: "Internal Server Error"});
    }
  },
};
