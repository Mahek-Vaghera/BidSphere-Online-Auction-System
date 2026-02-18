//middleware to validate required fields while creation
function validateCreateAuction(req, res, next) {
  const { title, name, category, condition, images, description, metadata, startingPrice, minIncrement, reservePrice, startTime, endTime } = req.body;

  if (!title || String(title).trim() === "") {
    return res.status(400).json({ 
      success: false, 
      message: "Auction title is required" 
    });
  }

  if (!name || String(name).trim() === "") {
    return res.status(400).json({ 
      success: false, 
      message: "Product name is required" 
      });
  }

  if (!category || String(category).trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Category is required and must be a non-empty string"
    });
  }

  const allowedConditions = ["new", "like new", "good", "fair"];
  if (!condition || !allowedConditions.includes(condition)) {
    return res.status(400).json({
      success: false,
      message: `Condition must be one of: ${allowedConditions.join(", ")}`
    });
  }

  const sp = Number(startingPrice);
  if (!Number.isFinite(sp) || sp < 0) {
    return res.status(400).json({ 
      success: false,
      message: "startingPrice is required and must be a non-negative number" 
    });
  }

  const mi = Number(minIncrement);
  if (!Number.isFinite(mi) || mi <= 0) {
    return res.status(400).json({ 
      success: false,
      message: "minIncrement is required and must be a positive number" 
    });
  }

   if (reservePrice !== undefined && reservePrice !== null && reservePrice !== "") {
    const rp = Number(reservePrice);

    if (!Number.isFinite(rp) || rp < 0) {
      return res.status(400).json({
        success: false,
        message: "reservePrice must be a non-negative number"
      });
    }

    if (rp < sp) {
      return res.status(400).json({
        success: false,
        message: "reservePrice must be greater than or equal to startingPrice"
      });
    }
  }

  if (!startTime || !endTime) {
    return res.status(400).json({ 
      success: false, 
      message: "startTime and endTime are required" 
    });
  }

  const s = new Date(startTime);
  const e = new Date(endTime);
  
  if (isNaN(s.getTime()) || isNaN(e.getTime())) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid startTime or endTime" 
    });
  }

  if (e <= s) {
    return res.status(400).json({ 
      success: false, 
      message: "endTime must be after startTime" 
    });
  }

  req.productData = {
    name: name.trim(),
    category: category.trim(),
    condition,
    images: Array.isArray(images) ? images.map(i => i.trim()) : [],
    metadata: metadata || {},
    description: description?.trim(),
  };

  next();
}

//middleware to validate allowed fields while updating auction
function validateUpdateAuction(req, res, next) {
  try {
    const allowedFields = [
      "title",
      "name",
      "description",
      "category",
      "condition",
      "images",
      "metadata",
      "startingPrice",
      "minIncrement",
      "startTime",
      "endTime",
    ];

    const updates = req.body;

    // Check for invalid fields
    const invalidFields = Object.keys(updates).filter(
      (f) => !allowedFields.includes(f)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid fields in update: ${invalidFields.join(", ")}`,
      });
    }

    // ---------- DATE VALIDATION ----------
    if ("startTime" in updates) {
      const start = new Date(updates.startTime);
      if (isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid startTime",
        });
      }
    }

    if ("endTime" in updates) {
      const end = new Date(updates.endTime);
      if (isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid endTime",
        });
      }

      // If startTime exists, check relation
      if ("startTime" in updates) {
        const start = new Date(updates.startTime);
        if (end <= start) {
          return res.status(400).json({
            success: false,
            message: "endTime must be after startTime",
          });
        }
      }
    }

    // ---------- NUMERIC VALIDATION ----------
    if ("startingPrice" in updates) {
      const sp = Number(updates.startingPrice);
      if (!Number.isFinite(sp) || sp < 0) {
        return res.status(400).json({
          success: false,
          message: "startingPrice must be a non-negative number",
        });
      }
    }

    if ("minIncrement" in updates) {
      const mi = Number(updates.minIncrement);
      if (!Number.isFinite(mi) || mi <= 0) {
        return res.status(400).json({
          success: false,
          message: "minIncrement must be a positive number",
        });
      }
    }

    // ---------- CONDITON VALIDATION ----------
    if ("condition" in updates) {
      const allowedConditions = ["new", "like new", "good", "fair"];
      if (!allowedConditions.includes(updates.condition)) {
        return res.status(400).json({
          success: false,
          message: `condition must be one of: ${allowedConditions.join(", ")}`,
        });
      }
    }

    // ---------- IMAGES VALIDATION ----------
    if ("images" in updates) {
      if (!Array.isArray(updates.images)) {
        return res.status(400).json({
          success: false,
          message: "images must be an array",
        });
      }

      updates.images = updates.images
        .map((i) => String(i).trim())
        .filter((i) => i.length > 0);
    }

    next();

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error while validating auction update",
      error: err.message,
    });
  }
}

export { 
  validateCreateAuction, 
  validateUpdateAuction
};