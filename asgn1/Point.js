class Point {
    constructor() {
      this.type = 'point';
      this.position = [0.0, 0.0, 0.0];
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.size = 5.0;
      this.state = 0;
    }
  
    render() {
      var xy = this.position;
      var rgba = this.color;
      var size = this.size;
  
      gl.disableVertexAttribArray(a_Position);
      // Pass the position of a point to a_Position variable
      gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      // Pass the size of a point to u_Size variable
      gl.uniform1f(u_Size, size);
      // Draw
      gl.drawArrays(gl.POINTS, 0, 1);
      //drawTriangle([xy[0], xy[1], xy[0]+.1, xy[1], xy[0], xy[1]+.1]);
    }

    cycleColors() {
      var interval = (1.0 / 255) * 20;
      if (this.state == 0) {
        this.color[1] += interval;
        if (this.color[1] >= 1.0) {
          this.color[1] = 1.0;
          this.state = 1;
        }
      }
      if (this.state == 1) {
        this.color[0] -= interval;
        if (this.color[0] <= 0) {
          this.color[0] = 0;
          this.state = 2;
        }
      }
      if (this.state == 2) {
        this.color[2] += interval;
        if (this.color[2] >= 1.0) {
          this.color[2] = 1.0;
          this.state = 3;
        }
      }
      if (this.state == 3) {
        this.color[1] -= interval;
        if (this.color[1] <= 0) {
          this.color[1] = 0.0;
          this.state = 4;
        }
      }
      if (this.state == 4) {
        this.color[0] += interval;
        if (this.color[0] >= 1.0) {
          this.color[0] = 1.0;
          this.state = 5;
        }
      }
      if (this.state == 5) {
        this.color[2] -= interval;
        if (this.color[2] <= 0) {
          this.color[2] = 0.0;
          this.state = 0;
        }
      }
    }
  }
